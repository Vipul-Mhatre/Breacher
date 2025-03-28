from flask import Flask, render_template, request, jsonify
import fitz  

app = Flask(__name__)

def extract_controls(text):
    """
    Extract controls that start with the word 'Ensure' from the text.
    """
    lines = text.split('\n')
    controls = [line.strip() for line in lines if line.strip().startswith("Ensure")]
    return controls

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
            controls = extract_controls(full_text)
            return jsonify({"controls": controls})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)