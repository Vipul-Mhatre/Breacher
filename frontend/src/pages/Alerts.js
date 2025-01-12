import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  makeStyles,
  Button,
} from '@material-ui/core';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  NotificationsActive as AlertIcon,
} from '@material-ui/icons';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../config';
import io from 'socket.io-client';
import AlertDetailsDialog from '../components/AlertDetailsDialog';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    height: '100%',
  },
  alertItem: {
    marginBottom: theme.spacing(1),
    borderLeft: `4px solid ${theme.palette.error.main}`,
    '&.acknowledged': {
      borderLeft: `4px solid ${theme.palette.success.main}`,
    },
  },
  severity: {
    marginRight: theme.spacing(1),
  },
  timestamp: {
    color: theme.palette.text.secondary,
  },
}));

function Alerts() {
  const classes = useStyles();
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    const socket = io(SOCKET_URL);

    socket.on('new-alert', (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/alerts`);
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await axios.post(`${API_URL}/alerts/${alertId}/acknowledge`);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === alertId
            ? { ...alert, status: 'acknowledged' }
            : alert
        )
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              <AlertIcon color="error" style={{ marginRight: 8 }} />
              Active Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <ListItem
                  key={alert._id}
                  className={`${classes.alertItem} ${
                    alert.status === 'acknowledged' ? 'acknowledged' : ''
                  }`}
                  component={Paper}
                  variant="outlined"
                >
                  <ListItemText
                    primary={
                      <>
                        <Chip
                          size="small"
                          label={alert.severity}
                          color={getSeverityColor(alert.severity)}
                          className={classes.severity}
                        />
                        {alert.type}
                      </>
                    }
                    secondary={
                      <>
                        <span className={classes.timestamp}>
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <br />
                        {alert.description}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => setSelectedAlert(alert)}
                      size="small"
                    >
                      <InfoIcon />
                    </IconButton>
                    {alert.status !== 'acknowledged' && (
                      <IconButton
                        edge="end"
                        onClick={() => handleAcknowledge(alert._id)}
                        size="small"
                        color="primary"
                        style={{ marginLeft: 8 }}
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {selectedAlert && (
        <AlertDetailsDialog
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledge}
        />
      )}
    </div>
  );
}

export default Alerts; 