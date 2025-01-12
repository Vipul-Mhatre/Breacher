import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  makeStyles,
  Box,
} from '@material-ui/core';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  section: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
  },
  value: {
    wordBreak: 'break-all',
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  severityIcon: {
    marginRight: theme.spacing(1),
  },
  high: {
    color: theme.palette.error.main,
  },
  medium: {
    color: theme.palette.warning.main,
  },
  low: {
    color: theme.palette.info.main,
  },
}));

function AlertDetailsDialog({ alert, onClose, onAcknowledge }) {
  const classes = useStyles();

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ErrorIcon className={`${classes.severityIcon} ${classes.high}`} />;
      case 'medium':
        return <WarningIcon className={`${classes.severityIcon} ${classes.medium}`} />;
      case 'low':
        return <InfoIcon className={`${classes.severityIcon} ${classes.low}`} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          {getSeverityIcon(alert.severity)}
          Alert Details - {alert.type}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Timestamp
            </Typography>
            <Typography className={classes.value}>
              {new Date(alert.timestamp).toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Severity
            </Typography>
            <Chip
              label={alert.severity}
              color={alert.severity.toLowerCase() === 'high' ? 'secondary' : 'default'}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Status
            </Typography>
            <Chip
              label={alert.status}
              color={alert.status === 'acknowledged' ? 'primary' : 'default'}
              size="small"
            />
          </Grid>

          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Description
            </Typography>
            <Typography className={classes.value}>
              {alert.description}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Source IP
            </Typography>
            <Typography className={classes.value}>{alert.sourceIp}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Location
            </Typography>
            <Typography className={classes.value}>
              {alert.location ? (
                `${alert.location.city}, ${alert.location.country}`
              ) : (
                'Unknown'
              )}
            </Typography>
          </Grid>

          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Affected Resources
            </Typography>
            {alert.affectedResources?.map((resource, index) => (
              <Chip
                key={index}
                label={resource}
                size="small"
                className={classes.chip}
              />
            ))}
          </Grid>

          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Raw Data
            </Typography>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(alert.rawData || alert, null, 2)}
            </pre>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {alert.status !== 'acknowledged' && (
          <Button
            onClick={() => onAcknowledge(alert._id)}
            color="primary"
          >
            Acknowledge
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AlertDetailsDialog; 