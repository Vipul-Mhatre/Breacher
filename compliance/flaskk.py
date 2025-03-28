from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

# Function Definitions
def check_firewall():
    firewall_status = subprocess.run(['ufw', 'status'], capture_output=True, text=True)
    if "Status: active" in firewall_status.stdout:
        return "Firewall Status: Configured (Active)"
    elif "inactive" in firewall_status.stdout:
        return "Firewall Status: Misconfigured (Inactive)"
    else:
        return "Firewall Status: Not Configured"

def check_password_expiration():
    try:
        with open('/etc/login.defs', 'r') as file:
            config = file.read()
        line = [line for line in config.splitlines() if 'PASS_MAX_DAYS' in line]
        if line:
            value = line[0].split()
            if len(value) > 1 and value[1].isdigit():
                max_days = int(value[1])
                return f"PASS_MAX_DAYS is set to {max_days}."
            else:
                return "PASS_MAX_DAYS is misconfigured or not set to a valid number."
        else:
            return "PASS_MAX_DAYS is not defined in the configuration."
    except FileNotFoundError:
        return "/etc/login.defs file not found."

def check_system_updates():
    updates = subprocess.run(['apt', 'list', '--upgradable'], capture_output=True, text=True)
    if "upgradable" in updates.stdout:
        return "System Updates: Misconfigured (Updates available)"
    else:
        return "System Updates: Configured (No updates needed)"

def check_ssh_root_login():
    ssh_config = subprocess.run(['grep', 'PermitRootLogin', '/etc/ssh/sshd_config'], capture_output=True, text=True)
    if "PermitRootLogin no" in ssh_config.stdout:
        return "SSH Root Login: Configured (Disabled)"
    elif "PermitRootLogin yes" in ssh_config.stdout:
        return "SSH Root Login: Misconfigured (Enabled)"
    else:
        return "SSH Root Login: Not Configured"

def check_user_groups():
    try:
        users_groups = subprocess.run(['getent', 'group'], capture_output=True, text=True)
        if users_groups.stdout:
            return "User Groups: Configured"
        else:
            return "User Groups: Not Configured"
    except:
        return "User Groups: Not Configured"

# Flask Routes
@app.route('/')
def home():
    return "Linux CIS Benchmark Compliance API. Use /check/all or specific endpoints for individual checks."

@app.route('/check/firewall')
def api_check_firewall():
    return jsonify(result=check_firewall())

@app.route('/check/password_expiration')
def api_check_password_expiration():
    return jsonify(result=check_password_expiration())

@app.route('/check/system_updates')
def api_check_system_updates():
    return jsonify(result=check_system_updates())

@app.route('/check/ssh_root_login')
def api_check_ssh_root_login():
    return jsonify(result=check_ssh_root_login())

@app.route('/check/user_groups')
def api_check_user_groups():
    return jsonify(result=check_user_groups())

@app.route('/check/all')
def api_check_all():
    results = {
        "Firewall": check_firewall(),
        "Password Expiration": check_password_expiration(),
        "System Updates": check_system_updates(),
        "SSH Root Login": check_ssh_root_login(),
        "User Groups": check_user_groups()
    }
    return jsonify(results)

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)