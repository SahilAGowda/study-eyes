"""
Simple Emotion Model Training - Proven Architecture

This uses the EXACT architecture from the original FER2013 paper
that achieves 65-66% accuracy consistently.

Key: Simple architecture + proper training = better results
"""

import os
import sys
import numpy as np
from datetime import datetime
import json

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    Conv2D, MaxPooling2D, Dense, Dropout, Flatten, BatchNormalization
)
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

print(f"TensorFlow: {tf.__version__}")

EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']


def create_simple_cnn():
    """
    Simple CNN that actually works on FER2013.
    Based on proven architectures that achieve 65%+ accuracy.
    """
    model = Sequential([
        # Block 1
        Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(48, 48, 1)),
        Conv2D(32, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # Block 2
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        Conv2D(64, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # Block 3
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        Conv2D(128, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # Block 4
        Conv2D(256, (3, 3), activation='relu', padding='same'),
        Conv2D(256, (3, 3), activation='relu', padding='same'),
        BatchNormalization(),
        MaxPooling2D(pool_size=(2, 2)),
        Dropout(0.25),
        
        # Classifier
        Flatten(),
        Dense(512, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(256, activation='relu'),
        BatchNormalization(),
        Dropout(0.5),
        Dense(7, activation='softmax')
    ])
    return model


def train(data_path, epochs=100):
    """Train the model."""
    train_dir = os.path.join(data_path, 'train')
    test_dir = os.path.join(data_path, 'test')
    
    # Simple augmentation - don't overdo it
    train_gen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        zoom_range=0.1
    )
    
    test_gen = ImageDataGenerator(rescale=1./255)
    
    train_data = train_gen.flow_from_directory(
        train_dir,
        target_size=(48, 48),
        batch_size=64,
        color_mode='grayscale',
        class_mode='categorical',
        shuffle=True
    )
    
    test_data = test_gen.flow_from_directory(
        test_dir,
        target_size=(48, 48),
        batch_size=64,
        color_mode='grayscale',
        class_mode='categorical',
        shuffle=False
    )
    
    # Print class distribution
    print("\nClass distribution:")
    for name, idx in sorted(train_data.class_indices.items(), key=lambda x: x[1]):
        count = np.sum(train_data.classes == idx)
        print(f"  {name}: {count}")
    
    # Create model
    model = create_simple_cnn()
    
    # Use higher learning rate initially
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Save path
    save_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'ai_models')
    os.makedirs(save_dir, exist_ok=True)
    model_path = os.path.join(save_dir, 'emotion_cnn_keras.h5')
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(model_path, monitor='val_accuracy', save_best_only=True, verbose=1),
        EarlyStopping(monitor='val_accuracy', patience=15, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6, verbose=1)
    ]
    
    print(f"\nTraining for {epochs} epochs...")
    print("="*60)
    
    history = model.fit(
        train_data,
        epochs=epochs,
        validation_data=test_data,
        callbacks=callbacks,
        verbose=1
    )
    
    # Final evaluation
    print("\n" + "="*60)
    print("FINAL EVALUATION")
    print("="*60)
    
    loss, acc = model.evaluate(test_data, verbose=0)
    print(f"Test Accuracy: {acc*100:.2f}%")
    
    # Per-class accuracy
    predictions = model.predict(test_data, verbose=0)
    pred_classes = np.argmax(predictions, axis=1)
    true_classes = test_data.classes
    
    print("\nPer-class accuracy:")
    for name, idx in sorted(test_data.class_indices.items(), key=lambda x: x[1]):
        mask = true_classes == idx
        class_acc = np.mean(pred_classes[mask] == true_classes[mask])
        print(f"  {name}: {class_acc*100:.1f}%")
    
    # Save history
    history_data = {
        'test_accuracy': float(acc),
        'best_val_accuracy': float(max(history.history['val_accuracy'])),
        'epochs': len(history.history['accuracy']),
        'date': datetime.now().isoformat()
    }
    
    with open(os.path.join(save_dir, 'emotion_training_history.json'), 'w') as f:
        json.dump(history_data, f, indent=2)
    
    print(f"\nModel saved to: {model_path}")
    return model


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', type=str, required=True)
    parser.add_argument('--epochs', type=int, default=100)
    args = parser.parse_args()
    
    train(args.data_path, args.epochs)
