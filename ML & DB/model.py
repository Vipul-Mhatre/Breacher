import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import lightgbm as lgb
from pymongo import MongoClient
import datetime
import ipaddress
import json
import plotly.express as px
import plotly.graph_objects as go
from sklearn.ensemble import IsolationForest
import tensorflow as tf
from tensorflow.keras import layers, Model
import logging
import os
from flask import Flask, jsonify, request
from bson import ObjectId
from pandas import Timestamp
import pickle
import os.path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, Timestamp):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        if isinstance(obj, datetime.datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        return super().default(obj)

app.json_encoder = CustomJSONEncoder

def convert_objectids(data):
    """Recursively convert ObjectIds to strings."""
    if isinstance(data, list):
        return [convert_objectids(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_objectids(val) for key, val in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data

class CyberSecurityDetectionSystem:
    def __init__(self, mongodb_uri="mongodb://localhost:27017/"):
        try:
            self.client = MongoClient(mongodb_uri)
            self.db = self.client['cybersecurity_db']
            self.alerts_collection = self.db['alerts']
        except Exception as e:
            raise
        self.lgbm_model = None
        self.isolation_forest = None
        self.autoencoder = None
        self.scaler = StandardScaler()
        self.feature_columns = None  # Store feature columns used during training
        self.severity_mapping = {
            "Low": 1, 
            "Medium": 2, 
            "High": 3, 
            "Critical": 4,
            "Unknown": 0
        }
        
    def preprocess_data(self, df):
        """Preprocess the cybersecurity data"""
        # Convert timestamp to unix timestamp
        df["Timestamp"] = pd.to_datetime(df['Timestamp'])
        df["Timestamp"] = df["Timestamp"].astype(int) // 10**9
        
        # Map severity levels
        severity_mapping = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        df["Attack Severity"] = df["Attack Severity"].map(severity_mapping)
        
        # Fill NaN values in Attack Severity with a default value (e.g., 0)
        df["Attack Severity"].fillna(0, inplace=True)
        
        # Convert boolean to int
        df["Data Exfiltrated"] = df["Data Exfiltrated"].astype(int)
        
        # Convert IP addresses to integers
        df["Source IP"] = [int(ipaddress.IPv4Address(ip)) for ip in df["Source IP"]]
        df["Destination IP"] = [int(ipaddress.IPv4Address(ip)) for ip in df["Destination IP"]]
        
        # Process User Agent if it exists
        if "User Agent" in df.columns:
            extracted_features = []
            for ua in df["User Agent"]:
                browser = "Unknown"
                device = "Desktop"
                
                if "Chrome" in ua:
                    browser = "Chrome"
                elif "Safari" in ua and "Chrome" not in ua:
                    browser = "Safari"
                elif "Firefox" in ua:
                    browser = "Firefox"
                    
                if "Android" in ua or "iPhone" in ua:
                    device = "Mobile"
                elif "iPad" in ua:
                    device = "Tablet"
                    
                extracted_features.append((browser, device))
                
            features_df = pd.DataFrame(extracted_features, columns=['Browser', 'Device'])
            
            # One-hot encode browser and device
            df['Browser_Chrome'] = (features_df['Browser'] == 'Chrome').astype(int)
            df['Browser_Firefox'] = (features_df['Browser'] == 'Firefox').astype(int)
            df['Browser_Safari'] = (features_df['Browser'] == 'Safari').astype(int)
            df['Device_Mobile'] = (features_df['Device'] == 'Mobile').astype(int)
            df['Device_Desktop'] = (features_df['Device'] == 'Desktop').astype(int)
            df['Device_Tablet'] = (features_df['Device'] == 'Tablet').astype(int)
            
            # Drop original User Agent column
            df.drop(columns=['User Agent'], inplace=True)
        
        # Map attack types to integers with better handling of unknown types
        attack_type_mapping = {
            "Malware": 1,
            "Phishing": 2,
            "Insider Threat": 3,
            "Ransomware": 4,
            "DDoS": 5,
            "Unknown": 0  # Add default mapping for unknown
        }
        if "Attack Type" in df.columns:
            df["Attack Type"] = df["Attack Type"].fillna("Unknown")
            df["Attack Type"] = df["Attack Type"].apply(lambda x: attack_type_mapping.get(x, 0))
        else:
            df["Attack Type"] = 0  # Set default value if column doesn't exist
        
        # Drop unnecessary columns if they exist
        columns_to_drop = ["Threat Intelligence", "Event ID"]
        df.drop(columns=[col for col in columns_to_drop if col in df.columns], inplace=True)
        
        # One-hot encode response actions
        df = pd.get_dummies(df, columns=['Response Action'])
        
        # Ensure all expected columns are present
        expected_columns = [
            'Response Action_Blocked', 'Response Action_Contained', 
            'Response Action_Eradicated', 'Response Action_Recovered', 
            'Response Action_Monitor'
        ]
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Ensure columns are in the same order as during training
        if self.feature_columns is not None:
            df = df.reindex(columns=self.feature_columns, fill_value=0)
        
        return df
    
    def perform_eda(self, df):
        """Perform Exploratory Data Analysis and return visualizations"""
        figures = {}
        
        # Attack Type Distribution
        fig_attack_dist = px.pie(df, names='Attack Type', title='Distribution of Attack Types')
        figures['attack_distribution'] = fig_attack_dist
        
        # Attack Severity Over Time
        fig_severity = px.line(df, x='Timestamp', y='Attack Severity', 
                             title='Attack Severity Timeline')
        figures['severity_timeline'] = fig_severity
        
        # Device Type Distribution
        device_dist = df[['Device_Mobile', 'Device_Desktop', 'Device_Tablet']].sum()
        fig_devices = px.bar(device_dist, title='Device Type Distribution')
        figures['device_distribution'] = fig_devices
        
        # Browser Usage
        browser_dist = df[['Browser_Chrome', 'Browser_Firefox', 'Browser_Safari']].sum()
        fig_browsers = px.bar(browser_dist, title='Browser Distribution')
        figures['browser_distribution'] = fig_browsers
        
        # Correlation Heatmap
        correlation = df.corr()
        fig_corr = go.Figure(data=go.Heatmap(z=correlation, x=correlation.columns, 
                                            y=correlation.columns))
        fig_corr.update_layout(title='Feature Correlation Heatmap')
        figures['correlation_heatmap'] = fig_corr
        
        os.makedirs("output", exist_ok=True)
        fig_attack_dist.write_image("output/attack_distribution.png")
        fig_severity.write_image("output/attack_severity_timeline.png")
        fig_devices.write_image("output/device_type_distribution.png")
        fig_browsers.write_image("output/browser_distribution.png")
        fig_corr.write_image("output/feature_correlation_heatmap.png")
        
        return figures

    def build_autoencoder(self, input_dim):
        """Build and compile autoencoder model"""
        encoding_dim = 32
        
        input_layer = layers.Input(shape=(input_dim,))
        encoded = layers.Dense(encoding_dim, activation='relu')(input_layer)
        encoded = layers.Dense(16, activation='relu')(encoded)
        
        decoded = layers.Dense(encoding_dim, activation='relu')(encoded)
        decoded = layers.Dense(input_dim, activation='sigmoid')(decoded)
        
        autoencoder = Model(input_layer, decoded)
        autoencoder.compile(optimizer='adam', loss='mse')
        
        return autoencoder

    def train_models(self, df):
        """Train all models: LightGBM, Isolation Forest, and Autoencoder"""
        # Prepare features and target
        X = df.drop('Attack Type', axis=1)
        y = df['Attack Type']
        
        # Store feature columns
        self.feature_columns = X.columns.tolist()
        
        # Split and scale data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train LightGBM
        train_data = lgb.Dataset(X_train_scaled, label=y_train)
        test_data = lgb.Dataset(X_test_scaled, label=y_test, reference=train_data)
        
        params = {
            'objective': 'multiclass',
            'num_class': 6,
            'metric': 'multi_logloss',
            'learning_rate': 0.1,
            'num_leaves': 31,
            'verbose': -1
        }
        
        self.lgbm_model = lgb.train(params, train_data, num_boost_round=100, valid_sets=[test_data])
        
        # Train Isolation Forest
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.isolation_forest.fit(X_train_scaled)
        
        # Train Autoencoder
        self.autoencoder = self.build_autoencoder(X_train_scaled.shape[1])
        self.autoencoder.fit(X_train_scaled, X_train_scaled,
                           epochs=50,
                           batch_size=32,
                           shuffle=True,
                           validation_data=(X_test_scaled, X_test_scaled),
                           verbose=0)
        
        os.makedirs("output", exist_ok=True)
        with open("output/model_performance.txt", "w") as f:
            f.write("Models trained successfully!\n")
            f.write("LightGBM Model:\n")
            f.write(f"Number of Boosting Rounds: {self.lgbm_model.best_iteration}\n")
            f.write(f"Best Score: {self.lgbm_model.best_score}\n")
            f.write("\nIsolation Forest Model:\n")
            f.write(f"Number of Estimators: {self.isolation_forest.n_estimators}\n")
            f.write("\nAutoencoder Model:\n")
            f.write(f"Input Dimension: {X_train_scaled.shape[1]}\n")
            f.write(f"Encoding Dimension: 32\n")
        
        return {
            'lgbm': self.lgbm_model,
            'isolation_forest': self.isolation_forest,
            'autoencoder': self.autoencoder
        }

    def _convert_ip_to_int(self, ip_str):
        """Helper function to convert IP address string to integer"""
        try:
            return int(ipaddress.IPv4Address(ip_str))
        except:
            # Return a default value or raise an error
            logging.warning(f"Invalid IP address: {ip_str}, using default value")
            return 0

    def _convert_severity_to_int(self, severity_str):
        """Helper function to convert severity string to integer"""
        try:
            # First try direct integer conversion
            return int(severity_str)
        except (ValueError, TypeError):
            # If that fails, try mapping the string
            return self.severity_mapping.get(severity_str, 0)

    def _prepare_alert_for_json(self, alert):
        """Convert alert data to JSON serializable format"""
        serializable_alert = alert.copy()
        # Convert ObjectId to string if present
        if '_id' in serializable_alert:
            serializable_alert['_id'] = str(serializable_alert['_id'])
        # Ensure all numeric types are native Python types
        for key, value in serializable_alert.items():
            if isinstance(value, np.integer):
                serializable_alert[key] = int(value)
            elif isinstance(value, np.floating):
                serializable_alert[key] = float(value)
        return serializable_alert

    def detect_anomalies(self, new_data):
        """Detect anomalies using all three models"""
        try:
            processed_data = self.preprocess_data(new_data.copy())  # Make a copy to avoid warnings
            
            # Get features excluding Attack Type if it exists
            feature_data = processed_data.copy()
            if 'Attack Type' in feature_data.columns:
                feature_data = feature_data.drop('Attack Type', axis=1)
            
            # Ensure all expected columns are present
            if self.feature_columns is None:
                raise ValueError("Feature columns are not set. Models need to be trained first.")
            
            # Add missing columns with zeros
            for col in self.feature_columns:
                if col not in feature_data.columns:
                    feature_data[col] = 0
            
            # Keep only the columns used during training
            feature_data = feature_data[self.feature_columns]
            
            scaled_data = self.scaler.transform(feature_data)
            
            # LightGBM predictions
            lgbm_predictions = self.lgbm_model.predict(scaled_data)
            lgbm_labels = [int(np.argmax(prob)) for prob in lgbm_predictions]
            
            # Isolation Forest predictions
            if_predictions = self.isolation_forest.predict(scaled_data)
            
            # Autoencoder predictions
            ae_predictions = self.autoencoder.predict(scaled_data)
            ae_mse = np.mean(np.power(scaled_data - ae_predictions, 2), axis=1)
            ae_threshold = np.percentile(ae_mse, 95)
            
            alerts = []
            for idx in range(len(new_data)):
                # Combine predictions
                is_anomaly = (
                    float(np.max(lgbm_predictions[idx])) > 0.8 or
                    if_predictions[idx] == -1 or
                    ae_mse[idx] > ae_threshold
                )
                
                if is_anomaly:
                    alert = {
                        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'source_ip': self._convert_ip_to_int(new_data.iloc[idx]['Source IP']),
                        'destination_ip': self._convert_ip_to_int(new_data.iloc[idx]['Destination IP']),
                        'attack_type': int(lgbm_labels[idx]),
                        'confidence': float(np.max(lgbm_predictions[idx])),
                        'severity': self._convert_severity_to_int(new_data.iloc[idx]['Attack Severity']),
                        'isolation_forest_anomaly': bool(if_predictions[idx] == -1),
                        'autoencoder_anomaly': bool(ae_mse[idx] > ae_threshold),
                        'autoencoder_score': float(ae_mse[idx])
                    }
                    alerts.append(alert)
                    
            if alerts:
                # Insert alerts into MongoDB
                inserted_alerts = self.alerts_collection.insert_many(alerts)
                # Convert alerts to JSON serializable format
                json_alerts = [self._prepare_alert_for_json(alert) for alert in alerts]
                return json_alerts
            
            return []
        
        except Exception as e:
            logging.error(f"Error in detect_anomalies: {str(e)}", exc_info=True)
            raise
    
    def get_recent_alerts(self, limit=10):
        """Retrieve recent alerts from MongoDB"""
        alerts = list(self.alerts_collection.find().sort('timestamp', -1).limit(limit))
        converted = convert_objectids(alerts)
        # Convert timestamps to consistent format
        for alert in converted:
            if isinstance(alert['timestamp'], datetime.datetime):
                alert['timestamp'] = alert['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        return converted

def json_serializable(obj):
    """Convert MongoDB ObjectId to string for JSON serialization."""
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

# Add global variable for system instance
system = None

# Add model persistence functions
def save_models(system):
    """Save trained models to disk"""
    os.makedirs("models", exist_ok=True)
    with open("models/system.pkl", "wb") as f:
        pickle.dump({
            'scaler': system.scaler,
            'lgbm': system.lgbm_model,
            'isolation_forest': system.isolation_forest,
            'autoencoder': system.autoencoder,
            'feature_columns': system.feature_columns
        }, f)

def load_models(system):
    """Load trained models from disk"""
    try:
        with open("models/system.pkl", "rb") as f:
            models = pickle.load(f)
            system.scaler = models['scaler']
            system.lgbm_model = models['lgbm']
            system.isolation_forest = models['isolation_forest']
            system.autoencoder = models['autoencoder']
            system.feature_columns = models.get('feature_columns', None)  # Handle missing feature_columns
        return True
    except FileNotFoundError:
        return False

def initialize_system():
    """Initialize and train the system on startup"""
    global system
    system = CyberSecurityDetectionSystem()
    
    # Try to load existing models first
    if load_models(system):
        logging.info("Loaded existing models successfully")
        if system.feature_columns is None:
            raise ValueError("Loaded models but feature columns are not set. Ensure the models are trained properly.")
        return system
        
    try:
        # Train new models if loading fails
        df = pd.read_csv("cybersecurity_dataset.csv")
        processed_df = system.preprocess_data(df)
        system.train_models(processed_df)
        save_models(system)
        logging.info("Models trained and saved successfully")
    except Exception as e:
        logging.error(f"Error initializing system: {e}")
        raise
    return system

# Modify the routes to use the global system instance
@app.route('/train', methods=['POST'])
def train():
    global system
    df = pd.read_csv("cybersecurity_dataset.csv")
    processed_df = system.preprocess_data(df)
    system.train_models(processed_df)
    system.perform_eda(processed_df)
    return jsonify({"message": "Models trained and EDA performed successfully!"})

@app.route('/detect', methods=['POST'])
def detect():
    global system
    if not system:
        return jsonify({"error": "System not initialized"}), 500
    
    try:
        data = request.json
        logging.info(f"Received detection request: {data}")
        
        # Convert data to expected format if it's a dict
        if isinstance(data, dict):
            data = [data]
        
        # Validate the data structure
        if not isinstance(data, list):
            return jsonify({"error": "Invalid data format. Expected list or dict"}), 400
            
        # Convert to DataFrame
        new_data = pd.DataFrame(data)
        logging.info(f"Converted to DataFrame: {new_data.columns}")
        
        # Ensure required fields are present
        required_fields = ['Source IP', 'Destination IP', 'Timestamp', 'Attack Severity']
        missing_fields = [field for field in required_fields if field not in new_data.columns]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400
        
        # Add missing columns if necessary
        if 'User Agent' not in new_data.columns:
            new_data['User Agent'] = 'Unknown'
        if 'Data Exfiltrated' not in new_data.columns:
            new_data['Data Exfiltrated'] = False
        if 'Attack Type' not in new_data.columns:
            new_data['Attack Type'] = 'Unknown'
            
        try:
            alerts = system.detect_anomalies(new_data)
            logging.info(f"Detection complete. Found {len(alerts)} alerts")
            # Alerts are already JSON serializable at this point
            return jsonify(alerts)
        except Exception as e:
            logging.error(f"Error in anomaly detection: {e}", exc_info=True)
            return jsonify({"error": f"Detection error: {str(e)}"}), 500
            
    except Exception as e:
        logging.error(f"Error processing detection request: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/alerts', methods=['GET'])
def alerts():
    global system
    if not system:
        return jsonify({"error": "System not initialized"}), 500
    recent_alerts = system.get_recent_alerts()
    return jsonify(recent_alerts)

if __name__ == "__main__":
    initialize_system()  # Initialize before running
    app.run(debug=True, port=5001)

