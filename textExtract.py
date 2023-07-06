import sys
import textract
import re

# Get the file path from command-line arguments
file_path = sys.argv[1]

# Check the file extension
if file_path.endswith('.docx'):
    # Extract text from the file
    text = textract.process(file_path, encoding='utf-8')

    # Clean up the text using regular expressions
    clean_text = re.sub(r'\n|\r', '', text.decode('utf-8'))  # Remove newlines and carriage returns

    # Print the cleaned text
    print(clean_text)
    
else:
    print("Invalid file format. Only .docx files are accepted.")
