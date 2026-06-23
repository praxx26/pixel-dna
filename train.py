import os
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

def create_model():
    """Builds the EfficientNetB0 model according to specifications."""
    base_model = EfficientNetB0(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model temporarily (optional, but good practice before fine-tuning)
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    outputs = Dense(1, activation='sigmoid')(x)
    
    model = Model(inputs=base_model.input, outputs=outputs)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(),
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train():
    """Trains the model with data augmentation."""
    dataset_dir = 'dataset_subset'
    train_dir = os.path.join(dataset_dir, 'train')
    val_dir = os.path.join(dataset_dir, 'test') # Use test as val if val doesn't exist
    
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        print(f"Dataset directories not found. Please run create_subset.py first to create {dataset_dir}.")
        return

    # Data augmentation for training
    # Notice: EfficientNet expects inputs in range [0, 255], and its preprocessing is built-in.
    # We apply normal augmentations and keep values in standard range before passing to the model.
    train_datagen = ImageDataGenerator(
        horizontal_flip=True,
        rotation_range=20,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
    )
    
    val_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.efficientnet.preprocess_input
    )
    
    # Explicitly map classes so REAL=0, FAKE=1
    
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='binary',
        classes=['REAL', 'FAKE'] # 0 = REAL, 1 = FAKE
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(224, 224),
        batch_size=32,
        class_mode='binary',
        classes=['REAL', 'FAKE']
    )
    
    model = create_model()
    model.summary()
    
    os.makedirs('models', exist_ok=True)
    model_path = os.path.join('models', 'ai_detector.h5')
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True),
        ModelCheckpoint(model_path, monitor='val_loss', save_best_only=True)
    ]
    
    print("Starting training...")
    history = model.fit(
        train_generator,
        epochs=3, # Reduced epochs for faster training
        validation_data=val_generator,
        callbacks=callbacks
    )
    
    print(f"Training complete. Best model saved to {model_path}")

if __name__ == "__main__":
    train()
