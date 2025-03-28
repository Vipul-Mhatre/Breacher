from flask import Flask, render_template, request, jsonify
import fitz  
import re

app = Flask(__name__)

def extract_structured_content(text):
    """
    Extract structured content like 1, 1.1, 1.1.1, etc., from the text.
    """
    pattern = re.compile(r'^(\d+(\.\d+)*)(\s+.*)', re.MULTILINE)
    matches = pattern.findall(text)

    structured_data = []
    for match in matches:
        number = match[0].strip()
        content = match[2].strip()
        structured_data.append({"number": number, "content": content})

    return structured_data

@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded!"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected!"}), 400

    if file:
        try:
            pdf_document = fitz.open(stream=file.read(), filetype="pdf")
            full_text = ""

            for page_num in range(len(pdf_document)):
                page = pdf_document.load_page(page_num)
                full_text += page.get_text()

            structured_content = extract_structured_content(full_text)
            return jsonify({"structured_content": structured_content})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)