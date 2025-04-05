# Receipt to Document Converter

This application uses computer vision techniques to process receipt images and convert them into document format for further data extraction.

## Setup

1. Install Python 3.8 or newer
2. Install required dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Install Tesseract OCR:
   - Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki
   - macOS: `brew install tesseract`
   - Linux: `sudo apt install tesseract-ocr`

4. Create a `.env` file with the path to Tesseract (example):
   ```
   TESSERACT_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe
   ```

## Usage

### Command Line

Run the receipt scanner:

```
python receipt_scanner.py --image path/to/receipt.jpg
```

The processed document will be saved in the `output` directory.

### Web Interface

The application includes a web interface that allows users to upload receipt images directly through a browser:

1. Start the web server:
   ```
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

3. Use the web interface to:
   - Upload receipt images from your device
   - Take photos of receipts using your device's camera
   - Process receipts automatically
   - View and download generated PDF documents
   - View extracted text

### Camera Features

The application supports two ways to capture receipts with a camera:

1. **Quick Capture**: On the main upload page, the file input supports camera capture on mobile devices.

2. **Advanced Camera Interface**: A dedicated camera page with preview and retake functionality.
   - Access it by clicking "Use Camera to Capture Receipt" on the main page
   - Works on mobile devices and laptops with webcams
   - Supports live preview before capturing
   - Allows reviewing the image before processing

For the best results when taking photos of receipts:
- Ensure good lighting
- Hold the camera steady
- Position the receipt to fill the frame
- Avoid shadows and glare on the receipt

## Features

- Automatic receipt detection and perspective correction
- OCR text extraction from receipts
- PDF document generation
- Web interface for easy upload and viewing of results
- Camera integration for direct capture of receipts 