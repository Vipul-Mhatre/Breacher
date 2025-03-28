#!/bin/bash

# 1. Check Firewall Status (CIS Control 3.5.1)
check_firewall() {
    firewall_status=$(ufw status)
    if [[ $firewall_status == *"Status: active"* ]]; then
        echo "Firewall Status: Configured (Active)"
    elif [[ $firewall_status == *"inactive"* ]]; then
        echo "Firewall Status: Misconfigured (Inactive)"
    else
        echo "Firewall Status: Not Configured"
    fi
}

# 2. Check Account Policies - Password Expiration (CIS Control 5.4.1.1)
check_password_expiration() {
    if [[ -f /etc/login.defs ]]; then
        max_days=$(grep "^PASS_MAX_DAYS" /etc/login.defs | awk '{print $2}')
        if [[ $max_days =~ ^[0-9]+$ ]]; then
            echo "PASS_MAX_DAYS is set to $max_days."
        else
            echo "PASS_MAX_DAYS is misconfigured or not set to a valid number."
        fi
    else
        echo "/etc/login.defs file not found."
    fi
}

# 3. Check for System Updates (CIS Control 3.2)
check_system_updates() {
    updates=$(apt list --upgradable 2>/dev/null | grep -v "^Listing" | wc -l)
    if [[ $updates -gt 0 ]]; then
        echo "System Updates: Misconfigured (Updates available)"
    else
        echo "System Updates: Configured (No updates needed)"
    fi
}

# 4. Ensure SSH Root Login is Disabled (CIS Control 5.2.3)
check_ssh_root_login() {
    if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config; then
        echo "SSH Root Login: Configured (Disabled)"
    elif grep -q "^PermitRootLogin yes" /etc/ssh/sshd_config; then
        echo "SSH Root Login: Misconfigured (Enabled)"
    else
        echo "SSH Root Login: Not Configured"
    fi
}

# 5. Check User Groups and Permissions (CIS Control 6.2.1)
check_user_groups() {
    groups=$(getent group)
    if [[ -n $groups ]]; then
        echo "User Groups: Configured"
    else
        echo "User Groups: Not Configured"
    fi
}

# Main function to run all checks
main() {
    echo "Linux CIS Benchmark Compliance Check:"
    check_firewall
    check_password_expiration
    check_system_updates
    check_ssh_root_login
    check_user_groups
}

# Run the main function
main
