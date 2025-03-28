import os
import subprocess

# 1. Check Firewall Status (CIS Control 3.5.1)
def check_firewall():
    firewall_status = subprocess.run(['ufw', 'status'], capture_output=True, text=True)
    if "Status: active" in firewall_status.stdout:
        return "Firewall Status: Configured (Active)"
    elif "inactive" in firewall_status.stdout:
        return "Firewall Status: Misconfigured (Inactive)"
    else:
        return "Firewall Status: Not Configured"

# 2. Check Account Policies - Password Expiration (CIS Control 5.4.1.1)
def check_password_expiration():
    try:
        with open('/etc/login.defs', 'r') as file:
            config = file.read()
        # Extract the PASS_MAX_DAYS value
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


# 3. Check for System Updates (CIS Control 3.2)
def check_system_updates():
    updates = subprocess.run(['apt', 'list', '--upgradable'], capture_output=True, text=True)
    if updates.stdout:
        return "System Updates: Misconfigured (Updates available)"
    else:
        return "System Updates: Configured (No updates needed)"

# 4. Ensure SSH Root Login is Disabled (CIS Control 5.2.3)
def check_ssh_root_login():
    ssh_config = subprocess.run(['grep', 'PermitRootLogin', '/etc/ssh/sshd_config'], capture_output=True, text=True)
    if "PermitRootLogin no" in ssh_config.stdout:
        return "SSH Root Login: Configured (Disabled)"
    elif "PermitRootLogin yes" in ssh_config.stdout:
        return "SSH Root Login: Misconfigured (Enabled)"
    else:
        return "SSH Root Login: Not Configured"

# 5. Check User Groups and Permissions (CIS Control 6.2.1)
def check_user_groups():
    try:
        users_groups = subprocess.run(['getent', 'group'], capture_output=True, text=True)
        if users_groups.stdout:
            return "User Groups: Configured"
        else:
            return "User Groups: Not Configured"
    except:
        return "User Groups: Not Configured"

# Main function to run all checks
def main():
    print("Linux CIS Benchmark Compliance Check:")
    print(check_firewall())
    print(check_password_expiration())
    print(check_system_updates())
    print(check_ssh_root_login())
    print(check_user_groups())

if __name__ == "__main__":
    main()

# demo script