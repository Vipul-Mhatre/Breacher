import os
import subprocess
import psutil
import socket
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__)

SCRIPTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts")

# linux
def run_bash_script():
    script_path = os.path.join(SCRIPTS_DIR, "linux_checks.sh")
    try:
        result = subprocess.run(["bash", script_path], capture_output=True, text=True)
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return str(e)

# Windows
def run_powershell_script():
    script_path = os.path.join(SCRIPTS_DIR, "windows_checks.ps1")
    try:
        result = subprocess.run(["powershell", "-File", script_path], capture_output=True, text=True)
        return result.stdout if result.returncode == 0 else result.stderr
    except Exception as e:
        return str(e)

def get_threat_data():
    threat_data = {
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'connections': []
    }
    
    connections = psutil.net_connections(kind='inet')
    for conn in connections:
        if conn.status == 'ESTABLISHED':
            try:
                process = psutil.Process(conn.pid) if conn.pid else None
                connection_info = {
                    'source_ip': conn.laddr.ip,
                    'source_port': conn.laddr.port,
                    'dest_ip': conn.raddr.ip if conn.raddr else 'N/A',
                    'dest_port': conn.raddr.port if conn.raddr else 'N/A',
                    'user_agent': 'Unknown',  # Would need HTTP inspection for this
                    'process_name': process.name() if process else 'Unknown',
                    'attack_type': 'Unknown',
                    'severity': 'Low',
                    'action': 'Monitor'
                }
                threat_data['connections'].append(connection_info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

    return threat_data

@app.route('/threat-data')
def get_real_time_threats():
    return jsonify(get_threat_data())

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/run', methods=['POST'])
def run_script():
    data = request.get_json()
    os_type = data.get("os_type")  
    if os_type == "linux":
        output = run_bash_script()
    elif os_type == "windows":
        output = run_powershell_script()
    else:
        output = "Invalid operating system selected."
    return jsonify({"output": output})

@app.route('/download-report', methods=['POST'])
def download_report():
    data = request.get_json()  
    os_type = data.get("os_type")

    if os_type == "linux":
        output = run_bash_script()
    elif os_type == "windows":
        output = run_powershell_script()
    else:
        output = "Invalid operating system selected."

    report_path = os.path.join(SCRIPTS_DIR, "report.txt")
    with open(report_path, "w") as report_file:
        report_file.write(" Compliance Report\n")
        report_file.write("=====================\n\n")
        report_file.write(output)

    return send_file(report_path, as_attachment=True)

@app.route('/threats')
def threats():
    return render_template("threats.html")

if __name__ == '__main__':
    app.run(debug=True)