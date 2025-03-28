from flask import Flask, render_template, request, jsonify
import fitz  
import re
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
import numpy as np

app = Flask(__name__)

training_data = [
    {"text": "partition", "severity": "High"},
    {"text": "shadow password", "severity": "Medium"},
    {"text": "mounting", "severity": "Low"},
    {"text": "audit logs", "severity": "High"},
    {"text": "password expiration", "severity": "Medium"},
    {"text": "access control", "severity": "High"},
    {"text": "SELinux", "severity": "Low"},
    {"text": "file permissions", "severity": "Medium"},
    {"text": "firewall", "severity": "High"},
    {"text": "logging system", "severity": "Low"},
]

texts = [item["text"] for item in training_data]
severities = [item["severity"] for item in training_data]
pipeline = Pipeline([
    ('vectorizer', CountVectorizer()),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])
pipeline.fit(texts, severities)

def extract_structured_content_with_ensure(text):
    index_pattern = re.compile(r'^(\d+(\.\d+)*)(\s+.*)', re.MULTILINE)
    lines_with_ensure = []
    topic_map = {}

    for match in index_pattern.finditer(text):
        number = match.group(1).strip()
        content = match.group(3).strip()
        topic_map[number] = content

    for line in text.split('\n'):
        if "Ensure" in line:
            hierarchy = {
                "Topic": None,
                "Subtopic": None,
                "Sub-subtopic": None,
                "Subsubsubtopic": None
            }
            for key in sorted(topic_map.keys(), reverse=True):
                if line.startswith(key):
                    parts = key.split('.')
                    if len(parts) >= 1:
                        hierarchy["Topic"] = topic_map.get(parts[0], None)
                    if len(parts) >= 2:
                        hierarchy["Subtopic"] = topic_map.get('.'.join(parts[:2]), None)
                    if len(parts) >= 3:
                        hierarchy["Sub-subtopic"] = topic_map.get('.'.join(parts[:3]), None)
                    if len(parts) >= 4:
                        hierarchy["Subsubsubtopic"] = topic_map.get('.'.join(parts[:4]), None)
                    break

            severity = pipeline.predict([line])[0]

            lines_with_ensure.append({
                "Line": line.strip(),
                "Topic": hierarchy["Topic"],
                "Subtopic": hierarchy["Subtopic"],
                "Sub-subtopic": hierarchy["Sub-subtopic"],
                "Subsubsubtopic": hierarchy["Subsubsubtopic"],
                "Severity": severity
            })

    return lines_with_ensure

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

            structured_content = extract_structured_content_with_ensure(full_text)

            json_path = "compliance_report.json"
            with open(json_path, "w") as json_file:
                json.dump(structured_content, json_file, indent=4)

            return jsonify({"structured_content": structured_content})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)