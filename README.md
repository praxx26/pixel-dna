# Civic Resolver

A comprehensive, multi-stage AI-powered image detection system built with Streamlit. Civic Resolver determines whether an uploaded image is Real or AI Generated using a hybrid detection pipeline.

## Features (3-Layer Pipeline)

1. **Metadata Analysis**: Extracts and analyzes EXIF and PNG text chunks for known AI generation software signatures (e.g., Stable Diffusion, Midjourney, DALL-E).
2. **OCR Watermark Detection**: Uses EasyOCR to scan the image for embedded text watermarks left by AI tools.
3. **Deep Learning Classification**: Utilizes a fine-tuned EfficientNetB0 Convolutional Neural Network (CNN) to predict if the image architecture resembles known AI patterns.

## Project Structure

```
civic_resolver/
│
├── app.py                     # Main Streamlit web application
├── train.py                   # Script to train the EfficientNetB0 model
├── split_dataset.py           # Script to split raw images into train/val/test
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
│
├── utils/                     # Pipeline modules
│   ├── metadata_checker.py    # Metadata extraction (Pillow)
│   ├── ocr_checker.py         # Text extraction (EasyOCR)
│   ├── predictor.py           # Inference logic (TensorFlow/Keras)
│   └── preprocess.py          # Image preprocessing for CNN
│
├── models/                    # Trained models (created after running train.py)
│   └── ai_detector.h5
│
└── dataset/                   # Structured image dataset
    ├── train/
    │   ├── real/
    │   └── fake/
    ├── val/
    │   ├── real/
    │   └── fake/
    └── test/
        ├── real/
        └── fake/
```

## Setup Instructions

### 1. Install Dependencies

It is recommended to use a virtual environment.

```bash
pip install -r requirements.txt
```

### 2. Prepare the Dataset

Once your dataset has finished downloading, place all your images into a source folder with `real` and `fake` subdirectories. Then run the splitting script to organize them into the `dataset/` folder:

```bash
# Edit split_dataset.py SOURCE_DIRECTORY variable to point to your raw data
python split_dataset.py
```

### 3. Train the Model

Train the EfficientNetB0 model on your split dataset. Note: Training deep learning models is computationally expensive; using a machine with a GPU (or Google Colab) is highly recommended.

```bash
python train.py
```
This will save the trained model to `models/ai_detector.h5`.

### 4. Run the Application

Launch the Streamlit frontend:

```bash
streamlit run app.py
```

Upload an image and Civic Resolver will provide a classification along with an explainable evidence panel.
