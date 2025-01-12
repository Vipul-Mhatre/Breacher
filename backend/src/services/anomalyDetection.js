const { LogModel } = require('../models/log.model');
const geoip = require('geoip-lite');

class AnomalyDetectionService {
  static async detectAnomaly(logData) {
    const anomalies = [];
    
    // Check various anomaly types
    const checks = await Promise.all([
      this.checkGeographicAnomaly(logData),
      this.checkTimeBasedAnomaly(logData),
      this.checkFailedLoginAttempts(logData),
      this.checkUnauthorizedAccess(logData),
      this.checkConfigurationChanges(logData),
      this.checkConcurrentSessions(logData)
    ]);

    return {
      isAnomaly: checks.some(check => check.isAnomaly),
      anomalies: checks.filter(check => check.isAnomaly)
                      .map(check => check.type)
    };
  }

  static async checkGeographicAnomaly(logData) {
    const { ip, userId } = logData;
    const geo = geoip.lookup(ip);

    // Get user's recent locations
    const recentLogs = await LogModel.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 }).limit(10);

    // Check if current location is significantly different
    const unusualLocation = recentLogs.every(log => {
      const prevGeo = geoip.lookup(log.ip);
      return prevGeo.country !== geo.country;
    });

    return {
      isAnomaly: unusualLocation,
      type: 'geographic_anomaly'
    };
  }

  static async checkTimeBasedAnomaly(logData) {
    const { timestamp, userId } = logData;
    const hour = new Date(timestamp).getHours();

    // Define working hours (e.g., 9 AM to 6 PM)
    const isWorkingHours = hour >= 9 && hour <= 18;

    // Check user's historical access patterns
    const historicalAccess = await LogModel.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const unusualTime = !isWorkingHours && historicalAccess.every(log => {
      const logHour = new Date(log.timestamp).getHours();
      return logHour >= 9 && logHour <= 18;
    });

    return {
      isAnomaly: unusualTime,
      type: 'time_based_anomaly'
    };
  }

  static async checkFailedLoginAttempts(logData) {
    const { userId, ip, statusCode } = logData;
    
    // Check for failed login attempts in the last hour
    const failedAttempts = await LogModel.countDocuments({
      ip,
      statusCode: 401,
      timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    return {
      isAnomaly: failedAttempts >= 5,
      type: 'failed_login_attempts'
    };
  }

  static async checkUnauthorizedAccess(logData) {
    const { statusCode, path } = logData;
    
    return {
      isAnomaly: statusCode === 403,
      type: 'unauthorized_access'
    };
  }

  static async checkConfigurationChanges(logData) {
    const { path, method } = logData;
    
    // Define sensitive paths
    const configPaths = ['/api/config', '/api/settings', '/api/admin'];
    const isSensitivePath = configPaths.some(p => path.startsWith(p));
    
    return {
      isAnomaly: isSensitivePath && ['PUT', 'POST', 'DELETE'].includes(method),
      type: 'configuration_change'
    };
  }

  static async checkConcurrentSessions(logData) {
    const { userId, ip } = logData;
    
    // Check for active sessions from different IPs in last 5 minutes
    const activeSessions = await LogModel.distinct('ip', {
      userId,
      timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    return {
      isAnomaly: activeSessions.length > 2 && !activeSessions.includes(ip),
      type: 'concurrent_sessions'
    };
  }
}

module.exports = AnomalyDetectionService; 