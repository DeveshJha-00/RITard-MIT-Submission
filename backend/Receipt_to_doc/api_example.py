#FOR MANUALLY UPLOADING FILES IN INPUT FOLDER AND GETTING PDF

import os
import argparse
from receipt_scanner import process_receipt

def find_image_files(directory):
    """
    Find all image files in the given directory
    """
    image_files = []
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    if os.path.exists(directory):
        for filename in os.listdir(directory):
            file_ext = os.path.splitext(filename)[1].lower()
            if file_ext in image_extensions:
                image_files.append(os.path.join(directory, filename))
    
    return image_files

def process_single_receipt(image_path):
    """
    Process a single receipt image and display results
    """
    print(f"Processing image: {image_path}")
    
    # Process the receipt
    result = process_receipt(image_path)
    
    # Extract data from the result
    document_path = result['document_path']
    text_content = result['text_content']
    
    # Print the results
    print("\nReceipt Processing Results:")
    print("---------------------------")
    print(f"Document saved to: {document_path}")
    
    # Example of further processing the extracted text
    print("\nExtracted Text Sample:")
    print("--------------------")
    lines = text_content.strip().split('\n')
    # Print first 10 lines of the extracted text
    for line in lines[:10]:
        print(line)
    
    print("\nExample of data extraction:")
    print("-------------------------")
    # This is a simplified example - in a real app, you would use more sophisticated parsing
    for line in lines:
        # Look for total amount
        if "total" in line.lower():
            print(f"Found total: {line}")
        # Look for date
        if "date" in line.lower():
            print(f"Found date: {line}")
    
    return result

def example_usage(process_all=False):
    """
    Example of how to use the receipt scanner as an API
    
    Args:
        process_all: If True, process all images in the input directory
    """
    # Input directory for receipt images
    input_dir = "input"
    
    # Find image files in the input directory
    image_files = find_image_files(input_dir)
    
    # Check if any images were found
    if not image_files:
        print(f"No image files found in the {input_dir} directory")
        print("Please add a receipt image to the input directory")
        return
    
    if process_all:
        print(f"Found {len(image_files)} image files to process")
        
        # Process all images
        for image_file in image_files:
            try:
                process_single_receipt(image_file)
                print("\n" + "="*50 + "\n")  # Separator between receipts
            except Exception as e:
                print(f"Error processing {image_file}: {str(e)}")
    else:
        # Process only the first image
        image_file = image_files[0]
        try:
            process_single_receipt(image_file)
        except Exception as e:
            print(f"Error processing {image_file}: {str(e)}")
    
    print("\nNext steps:")
    print("----------")
    print("1. Send the document to a document processing system")
    print("2. Extract structured data using regular expressions or a more advanced NLP model")
    print("3. Store the extracted data in a database")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process receipt images in the input directory')
    parser.add_argument('--all', action='store_true', help='Process all images in the input directory')
    args = parser.parse_args()
    
    example_usage(process_all=args.all) 