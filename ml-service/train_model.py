"""
Standalone script to train LSTM model
Run this to train the model before starting the API server
"""

from lstm_predictor import TouristSafetyLSTM
import sys
import os

def main():
    print("=" * 60)
    print("🧠 LSTM Tourist Safety Prediction - Model Training")
    print("=" * 60)
    print()
    
    # Check if Firebase credentials exist
    credentials_path = '../backend/serviceAccountKey.json'
    if not os.path.exists(credentials_path):
        print("❌ Error: Firebase credentials not found!")
        print(f"   Expected path: {credentials_path}")
        print("   Please ensure serviceAccountKey.json is in the backend directory.")
        sys.exit(1)
    
    print("✅ Firebase credentials found")
    print()
    
    # Initialize predictor
    print("📡 Initializing Firebase connection...")
    try:
        predictor = TouristSafetyLSTM(firebase_credentials_path=credentials_path)
        print("✅ Connected to Firebase Firestore")
        print()
    except Exception as e:
        print(f"❌ Firebase connection failed: {e}")
        sys.exit(1)
    
    # Get training parameters
    epochs = 50
    batch_size = 32
    
    if len(sys.argv) > 1:
        try:
            epochs = int(sys.argv[1])
        except ValueError:
            print("⚠️  Invalid epochs value, using default: 50")
    
    if len(sys.argv) > 2:
        try:
            batch_size = int(sys.argv[2])
        except ValueError:
            print("⚠️  Invalid batch_size value, using default: 32")
    
    print(f"📊 Training Configuration:")
    print(f"   Epochs: {epochs}")
    print(f"   Batch Size: {batch_size}")
    print(f"   Sequence Length: 24 hours")
    print(f"   Validation Split: 20%")
    print()
    
    # Train model
    try:
        print("🚀 Starting model training...")
        print("-" * 60)
        history = predictor.train(epochs=epochs, batch_size=batch_size)
        print("-" * 60)
        print()
        
        # Save model
        print("💾 Saving trained model...")
        predictor.save_model()
        print("✅ Model saved successfully!")
        print()
        
        # Display final metrics
        print("=" * 60)
        print("📈 Training Complete!")
        print("=" * 60)
        print(f"Final Training Loss: {history.history['loss'][-1]:.4f}")
        print(f"Final Validation Loss: {history.history['val_loss'][-1]:.4f}")
        print(f"Final Training MAE: {history.history['mae'][-1]:.4f}")
        print(f"Final Validation MAE: {history.history['val_mae'][-1]:.4f}")
        print()
        print("🎯 Model is ready for predictions!")
        print("   Start the API server with: python api_server.py")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
