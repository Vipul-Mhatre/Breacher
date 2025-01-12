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
  TableCell,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  NotificationsActive as AlertIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL, SOCKET_URL } from '../config';
import io from 'socket.io-client';
import AlertDetailsDialog from '../components/AlertDetailsDialog';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
}));

const StyledAlertItem = styled(ListItem)(({ theme, acknowledged }) => ({
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${acknowledged ? theme.palette.success.main : theme.palette.error.main}`,
}));

const StyledTimestamp = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

function Alerts() {
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
    <Root>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>
              <AlertIcon color="error" style={{ marginRight: 8 }} />
              Active Alerts
            </Typography>
            <List>
              {alerts.map((alert) => (
                <StyledAlertItem
                  key={alert._id}
                  acknowledged={alert.status === 'acknowledged'}
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
                        />
                        {alert.type}
                      </>
                    }
                    secondary={
                      <>
                        <StyledTimestamp>
                          {new Date(alert.timestamp).toLocaleString()}
                        </StyledTimestamp>
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
                </StyledAlertItem>
              ))}
            </List>
          </StyledPaper>
        </Grid>
      </Grid>

      {selectedAlert && (
        <AlertDetailsDialog
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledge}
        />
      )}
    </Root>
  );
}

export default Alerts; 