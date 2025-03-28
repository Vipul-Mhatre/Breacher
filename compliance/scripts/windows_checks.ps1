# 1. Check Firewall Status (CIS Control 3.5.1)
function checkfirewall {
    $firewallProfiles = Get-NetFirewallProfile
    foreach ($profile in $firewallProfiles) {
        if ($profile.Enabled -eq $true) {
            Write-Output "Firewall ($($profile.Name)): Configured (Active)"
        } else {
            Write-Output "Firewall ($($profile.Name)): Misconfigured (Inactive)"
        }
    }
}

# 2. Check Account Policies - Password Expiration (CIS Control 5.4.1.1)
function checkpwexpiration {
    $passwordPolicy = Get-ADDefaultDomainPasswordPolicy -ErrorAction SilentlyContinue
    if ($passwordPolicy) {
        Write-Output "Maximum Password Age: $($passwordPolicy.MaxPasswordAge.Days) days."
    } else {
        Write-Output "Password Policy: Not Configured or AD module not installed."
    }
}

# 3. Check for System Updates (CIS Control 3.2)
function checksystemupdates {
    $updates = Get-WindowsUpdate -Install -AcceptAll | Out-String
    if ($updates) {
        Write-Output "System Updates: Misconfigured (Updates available)"
    } else {
        Write-Output "System Updates: Configured (No updates needed)"
    }
}

# 4. Ensure Remote Desktop Access Is Restricted (CIS Control 5.2.3)
function checkremotedesktop {
    $rdpStatus = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections"
    if ($rdpStatus.fDenyTSConnections -eq 1) {
        Write-Output "Remote Desktop: Configured (Restricted)"
    } else {
        Write-Output "Remote Desktop: Misconfigured (Allowed)"
    }
}

# 5. Check User Groups and Permissions (CIS Control 6.2.1)
function checkusergroups {
    $localGroups = Get-LocalGroup
    if ($localGroups) {
        Write-Output "User Groups: Configured"
    } else {
        Write-Output "User Groups: Not Configured"
    }
}

# Main Function to Run All Checks
function Main {
    Write-Output "Windows CIS Benchmark Compliance Check:"
    checkfirewall
    checkpwexpiration
    checksystemupdates
    checkremotedesktop
    checkusergroups
}

# Run Main Function
Main