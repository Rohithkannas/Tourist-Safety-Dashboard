"""
Flask API Server for LSTM Predictions
Provides REST endpoints for tourist safety predictions
"""

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from lstm_predictor import TouristSafetyLSTM
import os
from datetime import datetime
import numpy as np
import json
import time
from threading import Thread
import queue

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize predictor
predictor = None

# Training progress queue
training_progress_queue = queue.Queue()
training_active = False

def initialize_predictor():
    """Initialize and load trained model"""
    global predictor
    try:
        predictor = TouristSafetyLSTM(
            firebase_credentials_path='../backend/serviceAccountKey.json'
        )
        
        # Try to load existing model
        if os.path.exists('models/lstm_model.h5'):
            predictor.load_model()
            print("✅ Loaded existing LSTM model")
        else:
            print("⚠️ No trained model found. Train the model first.")
            
    except Exception as e:
        print(f"❌ Error initializing predictor: {e}")

@app.route('/', methods=['GET'])
def index():
    """Root endpoint - API information"""
    return jsonify({
        'service': 'Tourist Safety LSTM Prediction API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'health': '/api/ml/health',
            'train': '/api/ml/train (POST)',
            'predict_risk': '/api/ml/predict/risk (POST)',
            'predict_hotspots': '/api/ml/predict/hotspots (POST)',
            'predict_tourist': '/api/ml/predict/tourist (POST)',
            'predict_batch': '/api/ml/predict/batch (POST)'
        },
        'model_loaded': predictor is not None and predictor.model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ml/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': predictor is not None and predictor.model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ml/train/progress', methods=['GET'])
def training_progress():
    """Stream training progress using Server-Sent Events"""
    def generate():
        while True:
            try:
                # Get progress update from queue (timeout after 1 second)
                progress = training_progress_queue.get(timeout=1)
                yield f"data: {json.dumps(progress)}\n\n"
                
                # If training is complete, stop streaming
                if progress.get('status') in ['completed', 'error']:
                    break
            except queue.Empty:
                # Send heartbeat to keep connection alive
                yield f"data: {{\"heartbeat\": true}}\n\n"
    
    return Response(stream_with_context(generate()), mimetype='text/event-stream')

@app.route('/api/ml/train', methods=['POST'])
def train_model():
    """
    Train LSTM model on Firebase data
    POST /api/ml/train
    Body: { "epochs": 50, "batch_size": 32 }
    """
    global training_active
    
    if training_active:
        return jsonify({
            'success': False,
            'error': 'Training already in progress'
        }), 400
    
    try:
        data = request.json or {}
        epochs = data.get('epochs', 50)
        batch_size = data.get('batch_size', 32)
        
        if predictor is None:
            initialize_predictor()
        
        # Start training in background thread
        training_active = True
        thread = Thread(target=train_model_background, args=(epochs, batch_size))
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Training started',
            'epochs': epochs,
            'batch_size': batch_size
        })
        
    except Exception as e:
        training_active = False
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def train_model_background(epochs, batch_size):
    """Background training function with progress updates"""
    global training_active, predictor
    
    try:
        # Send initial status
        training_progress_queue.put({
            'status': 'starting',
            'message': 'Initializing training...',
            'progress': 0
        })
        
        # Fetch data
        training_progress_queue.put({
            'status': 'fetching_data',
            'message': 'Fetching data from Firebase...',
            'progress': 5
        })
        
        data_dict = predictor.fetch_training_data()
        
        training_progress_queue.put({
            'status': 'preprocessing',
            'message': 'Preprocessing data...',
            'progress': 15
        })
        
        tourists_df, alerts_df = predictor.preprocess_data(data_dict)
        
        training_progress_queue.put({
            'status': 'creating_sequences',
            'message': 'Creating sequences...',
            'progress': 25
        })
        
        X, y = predictor.create_sequences(tourists_df)
        
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        training_progress_queue.put({
            'status': 'building_model',
            'message': 'Building model architecture...',
            'progress': 30
        })
        
        predictor.model = predictor.build_model(input_shape=(X.shape[1], X.shape[2]))
        
        # Custom callback for progress updates
        class ProgressCallback(tf.keras.callbacks.Callback):
            def __init__(self, total_epochs):
                super().__init__()
                self.total_epochs = total_epochs
            
            def on_epoch_end(self, epoch, logs=None):
                progress = 30 + int((epoch + 1) / self.total_epochs * 60)
                training_progress_queue.put({
                    'status': 'training',
                    'message': f'Epoch {epoch + 1}/{self.total_epochs}',
                    'progress': progress,
                    'epoch': epoch + 1,
                    'total_epochs': self.total_epochs,
                    'loss': float(logs.get('loss', 0)),
                    'val_loss': float(logs.get('val_loss', 0))
                })
        
        from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
        
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
        
        training_progress_queue.put({
            'status': 'training',
            'message': 'Training model...',
            'progress': 30
        })
        
        # Train model
        history = predictor.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            callbacks=[early_stopping, checkpoint, ProgressCallback(epochs)],
            verbose=0
        )
        
        training_progress_queue.put({
            'status': 'saving',
            'message': 'Saving model...',
            'progress': 95
        })
        
        # Save model
        predictor.save_model()
        
        # Send completion
        training_progress_queue.put({
            'status': 'completed',
            'message': 'Training completed successfully!',
            'progress': 100,
            'final_loss': float(history.history['loss'][-1]),
            'final_val_loss': float(history.history['val_loss'][-1]),
            'epochs_completed': len(history.history['loss'])
        })
        
    except Exception as e:
        training_progress_queue.put({
            'status': 'error',
            'message': str(e),
            'progress': 0
        })
    finally:
        training_active = False

@app.route('/api/ml/predict/risk', methods=['POST'])
def predict_risk():
    """
    Predict risk for a single tourist/location
    POST /api/ml/predict/risk
    Body: {
        "lat": 25.5788,
        "lng": 91.8933,
        "hour": 14,
        "day_of_week": 2,
        "day_of_month": 18,
        "month": 10
    }
    """
    try:
        if predictor is None or predictor.model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Train the model first.'
            }), 400
        
        data = request.json
        
        # Use current time if not provided
        now = datetime.now()
        tourist_data = {
            'lat': data.get('lat'),
            'lng': data.get('lng'),
            'hour': data.get('hour', now.hour),
            'day_of_week': data.get('day_of_week', now.weekday()),
            'day_of_month': data.get('day_of_month', now.day),
            'month': data.get('month', now.month),
            'risk_score': 0
        }
        
        # Validate required fields
        if tourist_data['lat'] is None or tourist_data['lng'] is None:
            return jsonify({
                'success': False,
                'error': 'lat and lng are required'
            }), 400
        
        # Predict
        risk_score = predictor.predict_risk(tourist_data)
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = 'low'
        elif risk_score < 0.6:
            risk_level = 'medium'
        elif risk_score < 0.8:
            risk_level = 'high'
        else:
            risk_level = 'critical'
        
        return jsonify({
            'success': True,
            'risk_score': float(risk_score),
            'risk_level': risk_level,
            'location': {
                'lat': tourist_data['lat'],
                'lng': tourist_data['lng']
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/predict/hotspots', methods=['POST'])
def predict_hotspots():
    """
    Predict risk hotspots for multiple locations
    POST /api/ml/predict/hotspots
    Body: {
        "locations": [
            {"lat": 25.5788, "lng": 91.8933, "name": "Shillong"},
            {"lat": 25.2676, "lng": 91.7320, "name": "Cherrapunji"}
        ],
        "time_window": 24
    }
    """
    try:
        if predictor is None or predictor.model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Train the model first.'
            }), 400
        
        data = request.json
        locations = data.get('locations', [])
        time_window = data.get('time_window', 24)
        
        if not locations:
            return jsonify({
                'success': False,
                'error': 'locations array is required'
            }), 400
        
        # Predict hotspots
        predictions = predictor.predict_hotspots(locations, time_window=time_window)
        
        return jsonify({
            'success': True,
            'hotspots': predictions,
            'time_window_hours': time_window,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/predict/tourist', methods=['POST'])
def predict_tourist_risk():
    """
    Predict risk for a tourist by ID (fetches from Firebase)
    POST /api/ml/predict/tourist
    Body: { "tourist_id": "T000001" }
    """
    try:
        if predictor is None or predictor.model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Train the model first.'
            }), 400
        
        data = request.json
        tourist_id = data.get('tourist_id')
        
        if not tourist_id:
            return jsonify({
                'success': False,
                'error': 'tourist_id is required'
            }), 400
        
        # Fetch tourist from Firebase
        tourists_ref = predictor.db.collection('tourists')
        query = tourists_ref.where('id', '==', tourist_id).limit(1)
        docs = query.stream()
        
        tourist_doc = None
        for doc in docs:
            tourist_doc = doc.to_dict()
            break
        
        if not tourist_doc:
            return jsonify({
                'success': False,
                'error': f'Tourist {tourist_id} not found'
            }), 404
        
        # Extract location
        location = tourist_doc.get('location', {})
        last_update = tourist_doc.get('lastUpdate')
        
        if isinstance(last_update, str):
            last_update = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
        
        # Prepare data for prediction
        tourist_data = {
            'lat': location.get('lat', 0),
            'lng': location.get('lng', 0),
            'hour': last_update.hour if last_update else datetime.now().hour,
            'day_of_week': last_update.weekday() if last_update else datetime.now().weekday(),
            'day_of_month': last_update.day if last_update else datetime.now().day,
            'month': last_update.month if last_update else datetime.now().month,
            'risk_score': 0
        }
        
        # Predict
        risk_score = predictor.predict_risk(tourist_data)
        
        # Determine risk level
        if risk_score < 0.3:
            risk_level = 'low'
        elif risk_score < 0.6:
            risk_level = 'medium'
        elif risk_score < 0.8:
            risk_level = 'high'
        else:
            risk_level = 'critical'
        
        return jsonify({
            'success': True,
            'tourist_id': tourist_id,
            'tourist_name': tourist_doc.get('name'),
            'risk_score': float(risk_score),
            'risk_level': risk_level,
            'location': location,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ml/predict/batch', methods=['POST'])
def predict_batch():
    """
    Predict risk for multiple tourists at once
    POST /api/ml/predict/batch
    Body: {
        "tourist_ids": ["T000001", "T000002", "T000003"]
    }
    """
    try:
        if predictor is None or predictor.model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded. Train the model first.'
            }), 400
        
        data = request.json
        tourist_ids = data.get('tourist_ids', [])
        
        if not tourist_ids:
            return jsonify({
                'success': False,
                'error': 'tourist_ids array is required'
            }), 400
        
        predictions = []
        
        for tourist_id in tourist_ids:
            try:
                # Fetch tourist from Firebase
                tourists_ref = predictor.db.collection('tourists')
                query = tourists_ref.where('id', '==', tourist_id).limit(1)
                docs = query.stream()
                
                tourist_doc = None
                for doc in docs:
                    tourist_doc = doc.to_dict()
                    break
                
                if not tourist_doc:
                    continue
                
                # Extract location
                location = tourist_doc.get('location', {})
                last_update = tourist_doc.get('lastUpdate')
                
                if isinstance(last_update, str):
                    last_update = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                
                # Prepare data for prediction
                tourist_data = {
                    'lat': location.get('lat', 0),
                    'lng': location.get('lng', 0),
                    'hour': last_update.hour if last_update else datetime.now().hour,
                    'day_of_week': last_update.weekday() if last_update else datetime.now().weekday(),
                    'day_of_month': last_update.day if last_update else datetime.now().day,
                    'month': last_update.month if last_update else datetime.now().month,
                    'risk_score': 0
                }
                
                # Predict
                risk_score = predictor.predict_risk(tourist_data)
                
                # Determine risk level
                if risk_score < 0.3:
                    risk_level = 'low'
                elif risk_score < 0.6:
                    risk_level = 'medium'
                elif risk_score < 0.8:
                    risk_level = 'high'
                else:
                    risk_level = 'critical'
                
                predictions.append({
                    'tourist_id': tourist_id,
                    'tourist_name': tourist_doc.get('name'),
                    'risk_score': float(risk_score),
                    'risk_level': risk_level,
                    'location': location
                })
                
            except Exception as e:
                print(f"Error predicting for {tourist_id}: {e}")
                continue
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'total': len(predictions),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Starting LSTM Prediction API Server...")
    initialize_predictor()
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=True)
