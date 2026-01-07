"""
Emotion Model Training - Based on proven Kaggle notebook architecture

This script uses the exact architecture from the emotion-detector.ipynb notebook
which achieved ~66% validation accuracy on FER2013.

Key features:
- TensorFlow/Keras Sequential model
- L2 regularization to prevent overfitting
- BatchNormalization for stable training
- Dropout for regularization
- Adam optimizer with low learning rate (0.0001)

Usage:
    python train_emotion_model.py --data_path d:\study-eyes\backend\data --epochs 60
"""

import os
import sys
import argparse
import numpy as np
from datetime import datetime
import json

# TensorFlow imports
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPool2D, Flatten, Dense, Dropout, BatchNormalization
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import regularizers
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

print(f"\n{'='*70}")
print(f"EMOTION MODEL TRAINING (TensorFlow/Keras)")
print(f"{'='*70}")
print(f"TensorFlow version: {tf.__version__}")
print(f"GPU available: {len(tf.config.list_physical_devices('GPU')) > 0}")
if len(tf.config.list_physical_devices('GPU')) > 0:
    print(f"GPU: {tf.config.list_physical_devices('GPU')}")
print(f"{'='*70}\n")

EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']


def create_model(img_size=48):
    """
    Create the CNN model - exact architecture from the Kaggle notebook.
    This architecture achieved ~66% validation accuracy.
    """
    model = Sequential()
    
    # Block 1
    model.add(Conv2D(32, kernel_size=(3, 3), padding='same', activation='relu', 
                     input_shape=(img_size, img_size, 1)))
    model.add(Conv2D(64, (3, 3), padding='same', activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPool2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Block 2
    model.add(Conv2D(128, (5, 5), padding='same', activation='relu'))
    model.add(BatchNormalization())
    model.add(MaxPool2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Block 3 - with L2 regularization
    model.add(Conv2D(512, (3, 3), padding='same', activation='relu', 
                     kernel_regularizer=regularizers.l2(0.01)))
    model.add(BatchNormalization())
    model.add(MaxPool2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Block 4 - with L2 regularization
    model.add(Conv2D(512, (3, 3), padding='same', activation='relu', 
                     kernel_regularizer=regularizers.l2(0.01)))
    model.add(BatchNormalization())
    model.add(MaxPool2D(pool_size=(2, 2)))
    model.add(Dropout(0.25))
    
    # Classifier
    model.add(Flatten())
    model.add(Dense(256, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.25))
    
    model.add(Dense(512, activation='relu'))
    model.add(BatchNormalization())
    model.add(Dropout(0.25))
    
    model.add(Dense(7, activation='softmax'))
    
    return model


def train_model(data_dir, epochs=60, batch_size=64, lr=0.0001):
    img_size = 48
    
    print(f"\n{'='*70}")
    print("SETTING UP DATA GENERATORS")
    print(f"{'='*70}")
    
    train_dir = os.path.join(data_dir, 'train')
    test_dir = os.path.join(data_dir, 'test')
    
    # Data augmentation for training - exactly as in the notebook
    train_datagen = ImageDataGenerator(
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
        rescale=1./255,
        validation_split=0.2
    )
    
    validation_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    train_generator = train_datagen.flow_from_directory(
        directory=train_dir,
        target_size=(img_size, img_size),
        batch_size=batch_size,
        color_mode="grayscale",
        class_mode="categorical",
        subset="training"
    )
    
    validation_generator = validation_datagen.flow_from_directory(
        directory=test_dir,
        target_size=(img_size, img_size),
        batch_size=batch_size,
        color_mode="grayscale",
        class_mode="categorical",
        subset="validation"
    )
    
    print(f"\n{'='*70}")
    print("CREATING MODEL")
    print(f"{'='*70}")
    
    model = create_model(img_size)
    
    # Compile with Adam optimizer and low learning rate
    model.compile(
        optimizer=Adam(learning_rate=lr),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    model.summary()
    
    # Setup save directory
    save_dir = os.path.join(os.path.dirname(__file__), '..', 'models', 'ai_models')
    os.makedirs(save_dir, exist_ok=True)
    
    # Callbacks
    checkpoint = ModelCheckpoint(
        os.path.join(save_dir, 'emotion_cnn_keras.h5'),
        monitor='val_accuracy',
        save_best_only=True,
        mode='max',
        verbose=1
    )
    
    early_stop = EarlyStopping(
        monitor='val_accuracy',
        patience=15,
        restore_best_weights=True,
        verbose=1
    )
    
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    )
    
    print(f"\n{'='*70}")
    print(f"STARTING TRAINING FOR {epochs} EPOCHS")
    print(f"{'='*70}\n")
    
    history = model.fit(
        train_generator,
        epochs=epochs,
        validation_data=validation_generator,
        callbacks=[checkpoint, early_stop, reduce_lr]
    )
    
    # Save final model
    model.save(os.path.join(save_dir, 'emotion_cnn_keras.h5'))
    
    # Save training history
    history_dict = {
        'accuracy': [float(x) for x in history.history['accuracy']],
        'val_accuracy': [float(x) for x in history.history['val_accuracy']],
        'loss': [float(x) for x in history.history['loss']],
        'val_loss': [float(x) for x in history.history['val_loss']]
    }
    with open(os.path.join(save_dir, 'emotion_training_history.json'), 'w') as f:
        json.dump(history_dict, f, indent=2)
    
    # Final summary
    print(f"\n{'='*70}")
    print("TRAINING COMPLETE")
    print(f"{'='*70}")
    print(f"Best validation accuracy: {max(history.history['val_accuracy'])*100:.2f}%")
    print(f"Final validation accuracy: {history.history['val_accuracy'][-1]*100:.2f}%")
    print(f"\nModel saved to: {os.path.join(save_dir, 'emotion_cnn_keras.h5')}")
    print(f"{'='*70}")
    
    return model, history


def main():
    parser = argparse.ArgumentParser(description='Emotion Model Training')
    parser.add_argument('--data_path', type=str, required=True, help='Path to FER2013 data')
    parser.add_argument('--epochs', type=int, default=60, help='Number of epochs')
    parser.add_argument('--batch_size', type=int, default=64, help='Batch size')
    parser.add_argument('--lr', type=float, default=0.0001, help='Learning rate')
    args = parser.parse_args()
    
    train_model(args.data_path, args.epochs, args.batch_size, args.lr)


if __name__ == '__main__':
    main()
