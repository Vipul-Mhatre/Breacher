import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import ipaddress
import json
import requests

@st.cache_resource
def initialize_system():
    return "http://localhost:5001"

def parse_datetime(dt_string):
    """Parse datetime string in multiple formats"""
    formats = [
        '%Y-%m-%d %H:%M:%S',     
        '%Y-%m-%dT%H:%M:%S.%f',
        '%Y-%m-%dT%H:%M:%S',     
        '%a, %d %b %Y %H:%M:%S GMT'  
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(dt_string, fmt)
        except ValueError:
            continue
    raise ValueError(f"No valid datetime format found for {dt_string}")

def main():
    st.title("Cybersecurity Threat Detection Dashboard")
    
    base_url = initialize_system()
    page = st.sidebar.selectbox("Navigation", ["Real-time Monitoring", "Batch Processing", "Historical Analysis", "System Statistics"])
    
    if page == "Real-time Monitoring":
        st.header("Real-time Threat Detection")
        
        with st.form("threat_check_form"):
            col1, col2, col3 = st.columns(3)
            with col1:
                source_ip = st.text_input("Source IP")
                user_agent = st.text_input("User Agent")
            
            with col2:
                dest_ip = st.text_input("Destination IP")
                attack_type = st.selectbox("Attack Type", [
                    "Unknown", "Malware", "Phishing", "Insider Threat", 
                    "Ransomware", "DDoS"
                ])
            
            with col3:
                attack_severity = st.selectbox("Attack Severity", [
                    "Low", "Medium", "High", "Critical"
                ])
                response_action = st.selectbox("Response Action", [
                    "Monitor", "Blocked", "Contained", "Eradicated", "Recovered"
                ])
            
            data_exfiltrated = st.checkbox("Data Exfiltrated")
            
            submitted = st.form_submit_button("Check for Threats")
            
            if submitted:
                try:
                    try:
                        ipaddress.ip_address(source_ip)
                        ipaddress.ip_address(dest_ip)
                    except ValueError:
                        st.error("Invalid IP address format")
                        return
                    
                    input_data = {
                        'Source IP': source_ip,
                        'Destination IP': dest_ip,
                        'Timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'User Agent': user_agent if user_agent else "Unknown",
                        'Attack Severity': attack_severity,
                        'Data Exfiltrated': bool(data_exfiltrated),
                        'Response Action': response_action,
                        'Attack Type': attack_type
                    }
                    
                    st.write("Sending data:", input_data)
                    
                    response = requests.post(
                        f"{base_url}/detect",
                        json=input_data,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if response.status_code != 200:
                        error_details = response.json()
                        st.error(f"Server Error: {error_details.get('error', 'Unknown error')}")
                        return
                    
                    alerts = response.json()
                    
                    if alerts:
                        st.error("⚠️ Potential threat detected!")
                        for alert in alerts:
                            st.write("Alert Details:")
                            st.json(alert)
                    else:
                        st.success("✅ No immediate threats detected")
                
                except requests.exceptions.RequestException as e:
                    st.error(f"Error processing input: {str(e)}")
        
        st.subheader("Recent Alerts")
        try:
            response = requests.get(f"{base_url}/alerts")
            response.raise_for_status()
            try:
                recent_alerts = response.json()
                for alert in recent_alerts:
                    alert['timestamp'] = parse_datetime(alert['timestamp'])
                    st.write("---")
                    st.write(alert)
            except json.JSONDecodeError as decode_err:
                st.error(f"Failed to decode JSON: {decode_err}")
            except ValueError as ve:
                st.error(f"Error parsing datetime: {ve}")
        except requests.exceptions.RequestException as req_err:
            st.error(f"Error fetching recent alerts: {str(req_err)}")
    
    elif page == "Batch Processing":
        st.header("Batch Threat Detection")
        
        uploaded_file = st.file_uploader("Upload JSON file with threat data", type=['json'])
        
        json_input = st.text_area(
            "Or paste JSON data here",
            height=300,
            help="Paste JSON array containing threat data"
        )
        
        col1, col2 = st.columns(2)
        with col1:
            upload_method = st.radio(
                "Choose input method",
                ["File Upload", "Text Input"]
            )
        
        with col2:
            process_batch = st.button("Process Batch Data")
        
        if process_batch:
            try:
                if upload_method == "File Upload" and uploaded_file is not None:
                    batch_data = json.load(uploaded_file)
                elif upload_method == "Text Input" and json_input:
                    batch_data = json.loads(json_input)
                else:
                    st.warning("Please provide input data either through file upload or text input")
                    return
                
                if not isinstance(batch_data, list):
                    batch_data = [batch_data]
                
                with st.spinner('Processing batch data...'):
                    progress_bar = st.progress(0)
                    total_records = len(batch_data)
                    
                    for i, record in enumerate(batch_data):
                        try:
                            response = requests.post(
                                f"{base_url}/detect",
                                json=record,
                                headers={'Content-Type': 'application/json'}
                            )
                            
                            if response.status_code == 200:
                                alerts = response.json()
                                if alerts:
                                    st.warning(f"⚠️ Threats detected in record {i+1}!")
                                    st.json(alerts)
                                else:
                                    st.success(f"✅ No threats detected in record {i+1}")
                            else:
                                st.error(f"Error processing record {i+1}: {response.json().get('error', 'Unknown error')}")
                            
                            progress_bar.progress((i + 1) / total_records)
                            
                        except Exception as e:
                            st.error(f"Error processing record {i+1}: {str(e)}")
                    
                    st.success("Batch processing complete!")
                    
            except json.JSONDecodeError:
                st.error("Invalid JSON format. Please check your input.")
            except Exception as e:
                st.error(f"Error processing batch data: {str(e)}")

    elif page == "Historical Analysis":
        st.header("Historical Threat Analysis")
        
        col1, col2 = st.columns(2)
        with col1:
            start_date = st.date_input("Start Date", datetime.now() - timedelta(days=7))
            start_datetime = datetime.combine(start_date, datetime.min.time())
        with col2:
            end_date = st.date_input("End Date", datetime.now())
            end_datetime = datetime.combine(end_date, datetime.max.time())
        
        try:
            response = requests.get(f"{base_url}/alerts")
            response.raise_for_status()
            historical_alerts = response.json()
            
            if historical_alerts:
                df_alerts = pd.DataFrame(historical_alerts)
                
                df_alerts['timestamp'] = df_alerts['timestamp'].apply(parse_datetime)
                
                mask = (df_alerts['timestamp'] >= start_datetime) & (df_alerts['timestamp'] <= end_datetime)
                df_alerts = df_alerts.loc[mask]
                
                if not df_alerts.empty:
                    # Threat timeline
                    fig_timeline = px.line(df_alerts, x='timestamp', y='severity',
                                         title='Threat Severity Timeline')
                    st.plotly_chart(fig_timeline)
                    
                    # Attack type distribution
                    fig_attack_dist = px.pie(df_alerts, names='attack_type',
                                           title='Distribution of Attack Types')
                    st.plotly_chart(fig_attack_dist)
                    
                    # Severity distribution
                    fig_severity = px.histogram(df_alerts, x='severity',
                                              title='Distribution of Threat Severity')
                    st.plotly_chart(fig_severity)
                else:
                    st.info("No historical data available for the selected date range")
            else:
                st.info("No historical data available")
        except requests.exceptions.RequestException as e:
            st.error(f"Error fetching historical data: {str(e)}")
    
    else: 
        st.header("System Statistics")
        
        try:
            response = requests.get(f"{base_url}/alerts")
            response.raise_for_status()
            all_alerts = response.json()
            
            st.markdown("### Overall Alert Statistics")
            col1, col2, col3 = st.columns(3)
            with col1:
                total_alerts = len(all_alerts)
                st.metric(
                    "Total Alerts Detected",
                    f"{total_alerts:,}",
                    help="Total number of security alerts detected since system initialization"
                )
                st.markdown(f"*Cumulative alerts across all severity levels*")
            
            with col2:
                recent_count = len([
                    alert for alert in all_alerts 
                    if parse_datetime(alert['timestamp']) >= datetime.now() - timedelta(hours=24)
                ])
                st.metric(
                    "Recent Alerts (Last 24h)",
                    f"{recent_count:,}",
                    delta=f"{recent_count - total_alerts//7}" if total_alerts > 0 else None,
                    help="Number of alerts detected in the last 24 hours"
                )
                st.markdown("*Showing recent threat activity*")
            
            with col3:
                high_severity = len([alert for alert in all_alerts if alert['severity'] >= 3])
                st.metric(
                    "Critical Security Threats",
                    f"{high_severity:,}",
                    help="Number of high and critical severity alerts"
                )
                st.markdown("*High priority threats requiring immediate attention*")
            
            if total_alerts > 0:
                st.markdown("### Threat Analysis")
                st.markdown(f"""
                - **Alert Distribution**: {(recent_count/total_alerts)*100:.1f}% of alerts occurred in the last 24 hours
                - **Critical Threat Ratio**: {(high_severity/total_alerts)*100:.1f}% of total alerts are high severity
                - **Average Daily Alerts**: {total_alerts/7:.1f} alerts per day (7-day average)
                """)
            
            st.markdown("### Model Performance Metrics")
            try:
                with open("output/model_performance.txt", "r") as f:
                    metrics_text = f.read()
                    st.markdown("```\n" + metrics_text + "\n```")
            except FileNotFoundError:
                st.info("Model performance metrics data is not available at this time")

        except requests.exceptions.RequestException as e:
            st.error(f"Error fetching system statistics: {str(e)}")

if __name__ == "__main__":
    main()