import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  CircularProgress,
  makeStyles,
  Box,
  Tooltip,
} from '@material-ui/core';
import {
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@material-ui/icons';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { API_URL } from '../config';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  metric: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthy: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  chart: {
    marginTop: theme.spacing(2),
  },
}));

function SystemHealthMonitor() {
  const classes = useStyles();
  const [healthData, setHealthData] = useState({
    status: 'loading',
    metrics: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
    },
    services: {
      database: 'healthy',
      blockchain: 'healthy',
      ai: 'healthy',
      fileScanner: 'healthy',
    },
    history: [],
  });

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await axios.get(`${API_URL}/system/health`);
      setHealthData(response.data);
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <HealthyIcon className={classes.healthy} />;
      case 'warning':
        return <WarningIcon className={classes.warning} />;
      case 'error':
        return <ErrorIcon className={classes.error} />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  const chartData = {
    labels: healthData.history.map(h => new Date(h.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU Usage',
        data: healthData.history.map(h => h.cpu),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Memory Usage',
        data: healthData.history.map(h => h.memory),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" gutterBottom>
        System Health
      </Typography>

      <Grid container spacing={3}>
        {/* Resource Metrics */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" className={classes.metric}>
            <Typography>CPU Usage</Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" style={{ marginRight: 8 }}>
                {healthData.metrics.cpu}%
              </Typography>
              {getStatusIcon(healthData.metrics.cpu > 80 ? 'error' : 
                           healthData.metrics.cpu > 60 ? 'warning' : 'healthy')}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" className={classes.metric}>
            <Typography>Memory Usage</Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" style={{ marginRight: 8 }}>
                {healthData.metrics.memory}%
              </Typography>
              {getStatusIcon(healthData.metrics.memory > 80 ? 'error' : 
                           healthData.metrics.memory > 60 ? 'warning' : 'healthy')}
            </Box>
          </Paper>
        </Grid>

        {/* Service Status */}
        {Object.entries(healthData.services).map(([service, status]) => (
          <Grid item xs={12} sm={6} md={3} key={service}>
            <Tooltip title={`${service} Status: ${status}`}>
              <Paper variant="outlined" className={classes.metric}>
                <Typography>
                  {service.charAt(0).toUpperCase() + service.slice(1)}
                </Typography>
                {getStatusIcon(status)}
              </Paper>
            </Tooltip>
          </Grid>
        ))}

        {/* Performance Charts */}
        <Grid item xs={12}>
          <Paper variant="outlined" className={classes.chart}>
            <Typography variant="subtitle1" gutterBottom>
              System Performance
            </Typography>
            <Line
              data={chartData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default SystemHealthMonitor; 