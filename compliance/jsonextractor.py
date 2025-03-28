import json
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Mocked training dataset 
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

# Preprocess training data
texts = [item["text"] for item in training_data]
severities = [item["severity"] for item in training_data]

# Build a simple ML pipeline
pipeline = Pipeline([
    ('vectorizer', CountVectorizer()),
    ('classifier', LogisticRegression())
])

# Train-test split for evaluation (optional)
X_train, X_test, y_train, y_test = train_test_split(texts, severities, test_size=0.2, random_state=42)
pipeline.fit(X_train, y_train)

file_path = 'pdf_extracted_data.txt'

with open(file_path, 'r') as file:
    raw_data = file.read()

# Clean the compliance data
controls = raw_data.splitlines()
unique_controls = sorted(set(controls))

predicted_data = [
    {"control": control, "predicted_severity": pipeline.predict([control])[0]}
    for control in unique_controls
]

json_path = "compliance_report.json"
with open(json_path, "w") as json_file:
    json.dump(predicted_data, json_file, indent=4)

print(f"JSON report generated: {json_path}")