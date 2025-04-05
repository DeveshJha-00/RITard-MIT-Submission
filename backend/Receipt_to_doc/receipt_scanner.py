import os
import argparse
import cv2
import numpy as np
import pytesseract
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError
import re
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Tesseract path
tesseract_path = os.getenv('TESSERACT_PATH')
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    logger.info(f"Using Tesseract from: {tesseract_path}")
else:
    logger.warning("Tesseract path not set in environment variables. Using system default.")

def resize_if_needed(image, max_dimension=2000):
    """
    Resize image if it's too large to process
    """
    height, width = image.shape[:2]
    
    # If image is already smaller than max_dimension, return original
    if height <= max_dimension and width <= max_dimension:
        return image
    
    # Calculate the ratio of the height and construct the dimensions
    ratio = max_dimension / float(max(height, width))
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    
    logger.info(f"Resizing large image from {width}x{height} to {new_width}x{new_height}")
    
    # Resize the image
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    return resized

def preprocess_image(image):
    """
    Preprocess the image to enhance features for better detection
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Apply adaptive thresholding to get binary image
        binary = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Apply dilation to strengthen the edges
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(binary, kernel, iterations=1)
        
        return dilated
    except Exception as e:
        logger.error(f"Error in preprocess_image: {str(e)}")
        raise

def find_receipt_contour(preprocessed_image, original_image):
    """
    Find the contour of the receipt in the image
    """
    try:
        # Find contours in the preprocessed image
        contours, _ = cv2.findContours(
            preprocessed_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Create a visualization copy of the original image
        receipt_visualization = original_image.copy()
        
        # Check if any contours were found
        if not contours:
            logger.warning("No contours found in the image")
            return None, receipt_visualization
        
        # Sort contours by area in descending order
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        
        # Get the largest contour (likely to be the receipt)
        receipt_contour = None
        for contour in contours:
            # Approximate the contour to a polygon
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
            
            # If the polygon has 4 vertices, we assume it's the receipt
            if len(approx) == 4:
                receipt_contour = approx
                break
        
        # If no quadrilateral contour is found, use the largest contour
        if receipt_contour is None and contours:
            largest_contour = contours[0]
            perimeter = cv2.arcLength(largest_contour, True)
            receipt_contour = cv2.approxPolyDP(largest_contour, 0.02 * perimeter, True)
            logger.info("No quadrilateral found. Using the largest contour.")
        
        # Draw the receipt contour for visualization
        if receipt_contour is not None:
            cv2.drawContours(receipt_visualization, [receipt_contour], -1, (0, 255, 0), 3)
        
        return receipt_contour, receipt_visualization
    except Exception as e:
        logger.error(f"Error in find_receipt_contour: {str(e)}")
        raise

def perspective_transform(image, contour):
    """
    Apply perspective transform to get a top-down view of the receipt
    """
    try:
        if contour is None or len(contour) < 4:
            # If no valid contour is found, return the original image
            logger.warning("No valid contour for perspective transform. Using original image.")
            return image
        
        # If we have more than 4 points, approximate to get 4 corners
        if len(contour) > 4:
            perimeter = cv2.arcLength(contour, True)
            contour = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
            
            # If we still don't have 4 points, just use the original image
            if len(contour) != 4:
                logger.warning(f"Contour has {len(contour)} points, expected 4. Using original image.")
                return image
        
        # Reorder points for correct perspective transform
        rect = order_points(contour.reshape(4, 2))
        
        # Calculate width and height for the new image
        (tl, tr, br, bl) = rect
        width_a = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        width_b = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        max_width = max(int(width_a), int(width_b))
        
        height_a = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        height_b = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        max_height = max(int(height_a), int(height_b))
        
        # Check for reasonable dimensions
        if max_width < 100 or max_height < 100:
            logger.warning("Resulting dimensions too small. Using original image.")
            return image
            
        if max_width > 5000 or max_height > 5000:
            logger.warning("Resulting dimensions too large. Using original image.")
            return image
        
        # Create the perspective transform matrix
        dst = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype=np.float32)
        
        # Apply the perspective transformation
        transform_matrix = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, transform_matrix, (max_width, max_height))
        
        return warped
    except Exception as e:
        logger.error(f"Error in perspective_transform: {str(e)}")
        # In case of error, return the original image
        return image

def order_points(pts):
    """
    Order points in top-left, top-right, bottom-right, bottom-left order
    """
    try:
        # Initialize result array
        rect = np.zeros((4, 2), dtype=np.float32)
        
        # Find top-left and bottom-right points
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # Top-left
        rect[2] = pts[np.argmax(s)]  # Bottom-right
        
        # Find top-right and bottom-left points
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # Top-right
        rect[3] = pts[np.argmax(diff)]  # Bottom-left
        
        return rect
    except Exception as e:
        logger.error(f"Error in order_points: {str(e)}")
        raise

def enhance_image_for_ocr(image):
    """
    Enhance the warped receipt image for better OCR results
    """
    try:
        # Convert to grayscale if not already
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Resize large images for better OCR performance
        # OCR works better on reasonably-sized images
        h, w = gray.shape
        if max(h, w) > 1500:
            scale_factor = 1500 / max(h, w)
            logger.info(f"Resizing image for OCR from {w}x{h} to {int(w*scale_factor)}x{int(h*scale_factor)}")
            gray = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_AREA)
        
        # Apply a series of image processing techniques to improve OCR quality
        
        # 1. Increase image size if it's too small (helps with small text)
        h, w = gray.shape
        if max(h, w) < 1000:
            scale_factor = min(1.5, 1000/max(h, w))
            logger.info(f"Enlarging small image for OCR by factor of {scale_factor}")
            enlarged = cv2.resize(gray, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)
        else:
            enlarged = gray
        
        # 2. Apply bilateral filter to reduce noise while preserving edges
        filtered = cv2.bilateralFilter(enlarged, 9, 75, 75)
        
        # 3. Apply adaptive thresholding for better handling of variable lighting
        adaptive_thresh = cv2.adaptiveThreshold(
            filtered, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # 4. Apply morphological operations to clean up the image
        kernel = np.ones((1, 1), np.uint8)
        opening = cv2.morphologyEx(adaptive_thresh, cv2.MORPH_OPEN, kernel)
        
        # 5. Apply additional contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(filtered)
        
        # 6. Final adaptive threshold after contrast enhancement
        final_thresh = cv2.adaptiveThreshold(
            enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # 7. Invert colors if needed (black text on white background is better for OCR)
        if np.mean(final_thresh) < 127:
            final_thresh = cv2.bitwise_not(final_thresh)
        
        return final_thresh
    except Exception as e:
        logger.error(f"Error in enhance_image_for_ocr: {str(e)}")
        # Return original grayscale in case of error
        return gray if 'gray' in locals() else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def save_as_document(image, output_path):
    """
    Save the processed image as a JPG file in original colors
    """
    try:
        # Make sure output path has .jpg extension
        jpg_path = output_path.replace('.pdf', '.jpg')
        if not jpg_path.endswith('.jpg'):
            jpg_path += '.jpg'
        
        # Convert to RGB if it's grayscale
        if len(image.shape) == 2:  # Grayscale image
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
        
        # Save as high-quality JPG
        cv2.imwrite(jpg_path, image, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        return jpg_path
    except Exception as e:
        logger.error(f"Error in save_as_document: {str(e)}")
        raise

def extract_text(image, timeout=30):
    """
    Extract text from the processed receipt image using OCR with improved settings
    """
    try:
        # Set Tesseract configuration for better OCR of receipts
        custom_config = r'--oem 3 --psm 6 -l eng --dpi 300'
        
        # Check image size and resize if needed to prevent Tesseract from hanging
        h, w = image.shape[:2] if len(image.shape) > 2 else image.shape
        
        # If image is too large, resize it before OCR
        if max(h, w) > 3000:
            scale = 3000 / max(h, w)
            new_w, new_h = int(w * scale), int(h * scale)
            logger.info(f"Image too large for OCR, resizing from {w}x{h} to {new_w}x{new_h}")
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        logger.info(f"Running OCR on image of size {image.shape[1]}x{image.shape[0]}")
        
        # Apply OCR
        text = pytesseract.image_to_string(image, config=custom_config)
        
        # Clean up the extracted text
        text = clean_text(text)
        
        return text
    except Exception as e:
        logger.error(f"Error in extract_text: {str(e)}")
        # Return empty string or error message in case of failure
        return f"Error extracting text: {str(e)}"

def clean_text(text):
    """
    Clean up the extracted text for better readability and accuracy
    """
    try:
        # Remove excessive newlines and spaces
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        
        # Clean up common OCR errors
        text = text.replace('|', 'I')  # Pipe often mistaken for letter I
        text = text.replace('[]', '0')  # Brackets often mistaken for zero
        
        # Convert multiple spaces to single space
        text = ' '.join(text.split())
        
        # Split text into lines again with single newlines
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            if line:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    except Exception as e:
        logger.error(f"Error in clean_text: {str(e)}")
        return text  # Return original text in case of error

def process_receipt(image_path, output_dir='output'):
    """
    Main function to process a receipt image
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    logger.info(f"Processing receipt: {image_path}")
    
    # Check if the file exists
    if not os.path.exists(image_path):
        error_msg = f"File not found: {image_path}"
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    try:
        # Read the input image
        image = cv2.imread(image_path)
        if image is None:
            error_msg = f"Could not read image: {image_path}. The file may be corrupted or not an image."
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Check image dimensions
        h, w = image.shape[:2]
        logger.info(f"Image dimensions: {w}x{h}")
        
        if h == 0 or w == 0:
            error_msg = "Invalid image dimensions (0 width or height)"
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        # Simple check to make sure we have a real image
        if h < 10 or w < 10:
            error_msg = f"Image too small: {w}x{h}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        # Resize very large images to prevent processing issues
        if max(h, w) > 2000:
            image = resize_if_needed(image)
            h, w = image.shape[:2]
            logger.info(f"Image resized to: {w}x{h}")
        
        # Keep a colored copy of the original image for the final JPG
        color_image = image.copy()
        
        # Preprocess the image
        logger.info("Preprocessing image...")
        preprocessed = preprocess_image(image)
        
        # Find the receipt contour
        logger.info("Finding receipt contours...")
        receipt_contour, visualization = find_receipt_contour(preprocessed, image)
        
        # Apply perspective transform to get a top-down view
        logger.info("Applying perspective transformation...")
        warped = perspective_transform(image, receipt_contour)
        
        # Also transform the color image
        color_warped = perspective_transform(color_image, receipt_contour)
        
        # Enhance the image for OCR
        logger.info("Enhancing image for OCR...")
        enhanced = enhance_image_for_ocr(warped)
        
        # Try multiple OCR approaches and combine results
        # First, try with enhanced image
        logger.info("Performing OCR on enhanced image...")
        text1 = extract_text(enhanced)
        
        # Second, try with inverted image for cases where text and background are reversed
        logger.info("Performing OCR on inverted image...")
        inverted = cv2.bitwise_not(enhanced)
        text2 = extract_text(inverted)
        
        # Use the longer text result, which usually indicates better OCR performance
        final_text = text1 if len(text1) > len(text2) else text2
        logger.info(f"Selected OCR result with {len(final_text)} characters")
        
        # Generate output file names
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_base = f"{base_name}_{timestamp}"
        
        # Save as final JPG document using the color version
        document_path = os.path.join(output_dir, f"{output_base}_document.jpg")
        logger.info(f"Saving JPG document in color: {document_path}")
        save_as_document(color_warped, document_path)
        
        # Save extracted text to a file
        text_path = os.path.join(output_dir, f"{output_base}_text.txt")
        logger.info(f"Saving extracted text: {text_path}")
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write(final_text)
        
        logger.info("Receipt processing complete")
        
        return {
            'document_path': document_path,
            'text_path': text_path,
            'text_content': final_text
        }
    except Exception as e:
        logger.error(f"Error processing receipt: {str(e)}", exc_info=True)
        raise

def main():
    """
    Main entry point
    """
    parser = argparse.ArgumentParser(description='Convert receipt images to documents')
    parser.add_argument('--image', required=True, help='Path to receipt image')
    parser.add_argument('--output', default='output', help='Output directory')
    args = parser.parse_args()
    
    try:
        result = process_receipt(args.image, args.output)
        print(f"Processing complete.")
        print(f"Document saved to: {result['document_path']}")
        print(f"Text extracted and saved to: {result['text_path']}")
    except Exception as e:
        print(f"Error processing receipt: {e}")

if __name__ == '__main__':
    main() 