"""
LSTM-based Tourist Safety Prediction System
Predicts risk levels, alert patterns, and tourist hotspots using Firebase data
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime, timedelta
import joblib

class TouristSafetyLSTM:
    """
    LSTM Model for predicting tourist safety metrics
    """
    
    def __init__(self, firebase_credentials_path):
        """Initialize Firebase and model parameters"""
        self.db = self._initialize_firebase(firebase_credentials_path)
        self.model = None
        self.scaler = MinMaxScaler()
        self.label_encoder = LabelEncoder()
        self.sequence_length = 24  # 24 hours of data
        self.feature_columns = []
        
    def _initialize_firebase(self, credentials_path):
        """Initialize Firebase Admin SDK"""
        try:
            cred = credentials.Certificate(credentials_path)
            firebase_admin.initialize_app(cred)
            return firestore.client()
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            return None
    
    def fetch_training_data(self):
        """
        Fetch data from Firebase Firestore for training
        Returns: DataFrame with combined tourist, alert, and location data
        """
        print("Fetching data from Firebase...")
        
        # Fetch tourists
        tourists_ref = self.db.collection('tourists')
        tourists = []
        for doc in tourists_ref.stream():
            data = doc.to_dict()
            data['doc_id'] = doc.id
            tourists.append(data)
        
        # Fetch alerts
        alerts_ref = self.db.collection('alerts')
        alerts = []
        for doc in alerts_ref.stream():
            data = doc.to_dict()
            data['doc_id'] = doc.id
            alerts.append(data)
        
        # Fetch zones
        zones_ref = self.db.collection('zones')
        zones = []
        for doc in zones_ref.stream():
            data = doc.to_dict()
            data['doc_id'] = doc.id
            zones.append(data)
        
        print(f"Fetched {len(tourists)} tourists, {len(alerts)} alerts, {len(zones)} zones")
        
        return {
            'tourists': pd.DataFrame(tourists),
            'alerts': pd.DataFrame(alerts),
            'zones': pd.DataFrame(zones)
        }
    
    def preprocess_data(self, data_dict):
        """
        Preprocess Firebase data for LSTM training
        Creates time-series features from tourist locations and alerts
        Handles missing columns gracefully
        """
        tourists_df = data_dict['tourists']
        alerts_df = data_dict['alerts']
        
        # Extract location coordinates with error handling
        tourists_df['lat'] = tourists_df['location'].apply(
            lambda x: x.get('lat', 0) if isinstance(x, dict) else 0
        )
        tourists_df['lng'] = tourists_df['location'].apply(
            lambda x: x.get('lng', 0) if isinstance(x, dict) else 0
        )
        
        # Convert timestamps with fallback to current time
        # Handle different possible timestamp field names
        timestamp_field = None
        for field in ['lastUpdate', 'lastSeen', 'checkInDate', 'timestamp']:
            if field in tourists_df.columns:
                timestamp_field = field
                break
        
        if timestamp_field:
            try:
                tourists_df['timestamp'] = pd.to_datetime(tourists_df[timestamp_field])
            except Exception as e:
                print(f"Warning: Could not parse {timestamp_field}, using current time")
                tourists_df['timestamp'] = pd.Timestamp.now()
        else:
            print("Warning: No timestamp field found, using current time")
            tourists_df['timestamp'] = pd.Timestamp.now()
        
        # Handle checkInDate separately if exists
        if 'checkInDate' in tourists_df.columns:
            try:
                tourists_df['checkInDate'] = pd.to_datetime(tourists_df['checkInDate'])
            except:
                tourists_df['checkInDate'] = pd.Timestamp.now()
        else:
            tourists_df['checkInDate'] = pd.Timestamp.now()
        
        # Process alerts if available
        if not alerts_df.empty:
            # Handle alert timestamps
            if 'timestamp' in alerts_df.columns:
                try:
                    alerts_df['timestamp'] = pd.to_datetime(alerts_df['timestamp'])
                except:
                    alerts_df['timestamp'] = pd.Timestamp.now()
            else:
                alerts_df['timestamp'] = pd.Timestamp.now()
            
            # Encode alert types if available
            if 'type' in alerts_df.columns:
                try:
                    alerts_df['type_encoded'] = self.label_encoder.fit_transform(alerts_df['type'])
                except:
                    alerts_df['type_encoded'] = 0
            else:
                alerts_df['type_encoded'] = 0
            
            # Encode priorities if available
            if 'priority' in alerts_df.columns:
                alerts_df['priority_encoded'] = alerts_df['priority'].map({
                    'low': 0, 'medium': 1, 'high': 2, 'critical': 3
                }).fillna(0)
            else:
                alerts_df['priority_encoded'] = 0
        
        # Create time-based features from timestamp
        tourists_df['hour'] = tourists_df['timestamp'].dt.hour
        tourists_df['day_of_week'] = tourists_df['timestamp'].dt.dayofweek
        tourists_df['day_of_month'] = tourists_df['timestamp'].dt.day
        tourists_df['month'] = tourists_df['timestamp'].dt.month
        
        # Aggregate alerts by location and time
        location_risk = self._calculate_location_risk(tourists_df, alerts_df)
        
        # Merge risk scores with tourist data
        tourists_df = tourists_df.merge(location_risk, on=['lat', 'lng'], how='left')
        tourists_df['risk_score'] = tourists_df['risk_score'].fillna(0)
        
        return tourists_df, alerts_df
    
    def _calculate_location_risk(self, tourists_df, alerts_df):
        """Calculate risk score for each location based on alerts"""
        if alerts_df.empty:
            # Return default risk scores for all tourist locations
            return pd.DataFrame({
                'lat': tourists_df['lat'].unique(),
                'lng': tourists_df['lng'].unique(),
                'risk_score': [0.0] * len(tourists_df['lat'].unique())
            })
        
        # Group alerts by location proximity (0.01 degree ~ 1km)
        location_groups = []
        
        # Extract alert locations safely
        if 'location' in alerts_df.columns:
            alerts_df['alert_lat'] = alerts_df['location'].apply(
                lambda x: x.get('lat', 0) if isinstance(x, dict) else 0
            )
            alerts_df['alert_lng'] = alerts_df['location'].apply(
                lambda x: x.get('lng', 0) if isinstance(x, dict) else 0
            )
        else:
            alerts_df['alert_lat'] = 0
            alerts_df['alert_lng'] = 0
        
        for _, tourist in tourists_df.iterrows():
            lat, lng = tourist['lat'], tourist['lng']
            
            # Skip invalid coordinates
            if lat == 0 and lng == 0:
                location_groups.append({
                    'lat': lat,
                    'lng': lng,
                    'risk_score': 0.0
                })
                continue
            
            # Count nearby alerts
            try:
                nearby_alerts = alerts_df[
                    (abs(alerts_df['alert_lat'] - lat) < 0.01) &
                    (abs(alerts_df['alert_lng'] - lng) < 0.01)
                ]
                
                risk_score = len(nearby_alerts) * 0.1
                if not nearby_alerts.empty and 'priority_encoded' in nearby_alerts.columns:
                    risk_score += nearby_alerts['priority_encoded'].mean() * 0.3
                
                location_groups.append({
                    'lat': lat,
                    'lng': lng,
                    'risk_score': min(risk_score, 1.0)  # Cap at 1.0
                })
            except Exception as e:
                print(f"Warning: Error calculating risk for location ({lat}, {lng}): {e}")
                location_groups.append({
                    'lat': lat,
                    'lng': lng,
                    'risk_score': 0.0
                })
        
        return pd.DataFrame(location_groups).drop_duplicates()
    
    def create_sequences(self, df, target_column='risk_score'):
        """
        Create time-series sequences for LSTM
        Returns: X (sequences), y (targets)
        """
        # Select feature columns
        self.feature_columns = ['lat', 'lng', 'hour', 'day_of_week', 'day_of_month', 'month', 'risk_score']
        
        # Ensure all columns exist
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Sort by time using timestamp field
        if 'timestamp' in df.columns:
            df = df.sort_values('timestamp')
        elif 'checkInDate' in df.columns:
            df = df.sort_values('checkInDate')
        else:
            print("Warning: No time column found for sorting, using original order")
        
        # Extract features
        features = df[self.feature_columns].values
        
        # Check if we have enough data
        if len(features) < self.sequence_length + 1:
            print(f"Warning: Not enough data points ({len(features)}) for sequence length ({self.sequence_length})")
            print("Reducing sequence length to fit available data")
            self.sequence_length = max(1, len(features) // 2)
        
        # Normalize features
        features_scaled = self.scaler.fit_transform(features)
        
        # Create sequences
        X, y = [], []
        for i in range(len(features_scaled) - self.sequence_length):
            X.append(features_scaled[i:i + self.sequence_length])
            y.append(features_scaled[i + self.sequence_length, -1])  # Predict risk_score
        
        if len(X) == 0:
            raise ValueError(f"Could not create any sequences. Need at least {self.sequence_length + 1} data points, got {len(features)}")
        
        return np.array(X), np.array(y)
    
    def build_model(self, input_shape):
        """
        Build Bidirectional LSTM model for risk prediction
        """
        model = Sequential([
            Bidirectional(LSTM(128, return_sequences=True), input_shape=input_shape),
            Dropout(0.3),
            Bidirectional(LSTM(64, return_sequences=True)),
            Dropout(0.3),
            LSTM(32),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1, activation='sigmoid')  # Risk score between 0 and 1
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mse']
        )
        
        return model
    
    def train(self, epochs=50, batch_size=32, validation_split=0.2):
        """
        Train the LSTM model on Firebase data
        """
        print("Starting training process...")
        
        # Fetch and preprocess data
        data_dict = self.fetch_training_data()
        tourists_df, alerts_df = self.preprocess_data(data_dict)
        
        # Create sequences
        X, y = self.create_sequences(tourists_df)
        
        print(f"Created {len(X)} sequences with shape {X.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Build model
        self.model = self.build_model(input_shape=(X.shape[1], X.shape[2]))
        
        print("Model architecture:")
        self.model.summary()
        
        # Callbacks
        early_stopping = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        checkpoint = ModelCheckpoint(
            'models/best_model.h5',
            monitor='val_loss',
            save_best_only=True
        )
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping, checkpoint],
            verbose=1
        )
        
        # Evaluate on test set
        test_loss, test_mae, test_mse = self.model.evaluate(X_test, y_test)
        print(f"\nTest Results:")
        print(f"Loss: {test_loss:.4f}")
        print(f"MAE: {test_mae:.4f}")
        print(f"MSE: {test_mse:.4f}")
        
        return history
    
    def predict_risk(self, tourist_data):
        """
        Predict risk score for a tourist or location
        
        Args:
            tourist_data: dict with keys ['lat', 'lng', 'hour', 'day_of_week', etc.]
        
        Returns:
            float: Predicted risk score (0-1)
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Prepare input sequence
        features = []
        for col in self.feature_columns:
            features.append(tourist_data.get(col, 0))
        
        # Create sequence (repeat for sequence_length)
        sequence = np.array([features] * self.sequence_length)
        sequence_scaled = self.scaler.transform(sequence)
        sequence_scaled = sequence_scaled.reshape(1, self.sequence_length, len(self.feature_columns))
        
        # Predict
        prediction = self.model.predict(sequence_scaled, verbose=0)
        
        return float(prediction[0][0])
    
    def predict_hotspots(self, locations, time_window=24):
        """
        Predict risk hotspots for multiple locations
        
        Args:
            locations: list of dicts with 'lat', 'lng'
            time_window: hours to predict ahead
        
        Returns:
            list of dicts with location and predicted risk
        """
        predictions = []
        current_time = datetime.now()
        
        for loc in locations:
            risk_scores = []
            
            # Predict for each hour in time window
            for hour_offset in range(time_window):
                future_time = current_time + timedelta(hours=hour_offset)
                
                tourist_data = {
                    'lat': loc['lat'],
                    'lng': loc['lng'],
                    'hour': future_time.hour,
                    'day_of_week': future_time.weekday(),
                    'day_of_month': future_time.day,
                    'month': future_time.month,
                    'risk_score': 0  # Will be predicted
                }
                
                risk = self.predict_risk(tourist_data)
                risk_scores.append(risk)
            
            predictions.append({
                'location': loc,
                'avg_risk': np.mean(risk_scores),
                'max_risk': np.max(risk_scores),
                'risk_trend': risk_scores
            })
        
        # Sort by average risk
        predictions.sort(key=lambda x: x['avg_risk'], reverse=True)
        
        return predictions
    
    def save_model(self, model_path='models/lstm_model.h5', scaler_path='models/scaler.pkl'):
        """Save trained model and scaler"""
        os.makedirs('models', exist_ok=True)
        self.model.save(model_path)
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.feature_columns, 'models/feature_columns.pkl')
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path='models/lstm_model.h5', scaler_path='models/scaler.pkl'):
        """Load trained model and scaler"""
        self.model = load_model(model_path)
        self.scaler = joblib.load(scaler_path)
        self.feature_columns = joblib.load('models/feature_columns.pkl')
        print(f"Model loaded from {model_path}")


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = TouristSafetyLSTM(
        firebase_credentials_path='../backend/serviceAccountKey.json'
    )
    
    # Train model
    print("Training LSTM model on Firebase data...")
    history = predictor.train(epochs=50, batch_size=32)
    
    # Save model
    predictor.save_model()
    
    # Example prediction
    test_tourist = {
        'lat': 25.5788,
        'lng': 91.8933,
        'hour': 14,
        'day_of_week': 2,
        'day_of_month': 18,
        'month': 10,
        'risk_score': 0
    }
    
    risk = predictor.predict_risk(test_tourist)
    print(f"\nPredicted risk for Shillong at 2 PM: {risk:.4f}")
    
    # Predict hotspots
    locations = [
        {'lat': 25.5788, 'lng': 91.8933, 'name': 'Shillong'},
        {'lat': 25.2676, 'lng': 91.7320, 'name': 'Cherrapunji'},
        {'lat': 25.5138, 'lng': 90.2036, 'name': 'Tura'}
    ]
    
    hotspots = predictor.predict_hotspots(locations, time_window=24)
    print("\nTop Risk Hotspots (next 24 hours):")
    for i, spot in enumerate(hotspots[:5], 1):
        print(f"{i}. {spot['location']['name']}: {spot['avg_risk']:.4f} avg risk")
