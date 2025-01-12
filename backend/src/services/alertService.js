const { LogModel } = require('../models/log.model');
const { sendEmail } = require('../utils/email');

class AlertService {
  constructor(io) {
    this.io = io;
  }

  async handleAnomaly(anomalyData) {
    try {
      // Save alert to database
      const alert = await this.saveAlert(anomalyData);
      
      // Send real-time notification
      this.sendRealTimeAlert(alert);
      
      // Send email notification if critical
      if (this.isCriticalAnomaly(anomalyData)) {
        await this.sendEmailAlert(anomalyData);
      }

      return alert;
    } catch (error) {
      console.error('Error handling anomaly:', error);
      throw error;
    }
  }

  async saveAlert(anomalyData) {
    const alert = new LogModel({
      ...anomalyData,
      isAnomaly: true,
      alertStatus: 'new',
      severity: this.calculateSeverity(anomalyData)
    });

    return await alert.save();
  }

  sendRealTimeAlert(alert) {
    this.io.emit('new-alert', {
      type: 'anomaly',
      data: alert
    });
  }

  calculateSeverity(anomalyData) {
    // Implement severity calculation logic based on anomaly type
    const severityMap = {
      'unauthorized_access': 'high',
      'configuration_change': 'high',
      'concurrent_sessions': 'medium',
      'geographic_anomaly': 'medium',
      'time_based_anomaly': 'low'
    };

    return severityMap[anomalyData.type] || 'low';
  }

  isCriticalAnomaly(anomalyData) {
    return this.calculateSeverity(anomalyData) === 'high';
  }

  async sendEmailAlert(anomalyData) {
    const emailData = {
      subject: `Security Alert: ${anomalyData.type}`,
      text: `Critical security alert detected:\n\n${JSON.stringify(anomalyData, null, 2)}`,
      to: process.env.ADMIN_EMAIL
    };

    await sendEmail(emailData);
  }
}

module.exports = AlertService; 