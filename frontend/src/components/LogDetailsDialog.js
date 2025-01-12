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
} from '@material-ui/core';

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
}));

function LogDetailsDialog({ log, onClose }) {
  const classes = useStyles();

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Log Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Timestamp
            </Typography>
            <Typography className={classes.value}>
              {new Date(log.timestamp).toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Type
            </Typography>
            <Typography className={classes.value}>{log.type}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Status
            </Typography>
            <Chip
              label={log.isAnomaly ? 'Anomaly' : 'Normal'}
              color={log.isAnomaly ? 'secondary' : 'default'}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              IP Address
            </Typography>
            <Typography className={classes.value}>{log.ip}</Typography>
          </Grid>

          <Grid item xs={12} sm={6} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Location
            </Typography>
            <Typography className={classes.value}>
              {log.location ? (
                `${log.location.city}, ${log.location.country}`
              ) : (
                'Unknown'
              )}
            </Typography>
          </Grid>

          {log.isAnomaly && (
            <Grid item xs={12} className={classes.section}>
              <Typography variant="subtitle2" className={classes.label}>
                Anomaly Details
              </Typography>
              {log.anomalies.map((anomaly, index) => (
                <Chip
                  key={index}
                  label={anomaly}
                  color="secondary"
                  size="small"
                  className={classes.chip}
                />
              ))}
            </Grid>
          )}

          <Grid item xs={12} className={classes.section}>
            <Typography variant="subtitle2" className={classes.label}>
              Raw Data
            </Typography>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(log, null, 2)}
            </pre>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LogDetailsDialog; 