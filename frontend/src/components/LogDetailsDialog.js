import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  styled,
} from '@mui/material';
import api from '../services/api';

const StyledSection = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.text.secondary,
}));

const StyledValue = styled('div')({
  wordBreak: 'break-all',
});

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

function LogDetailsDialog({ log, onClose }) {
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const verifyLog = async () => {
      try {
        const response = await api.get(`/logs/${log._id}/verify`);
        setVerificationStatus(response.data.verified);
      } catch (error) {
        console.error('Error verifying log:', error);
        setVerificationStatus(false);
      }
    };
    
    verifyLog();
  }, [log._id]);

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Log Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Timestamp
            </StyledLabel>
            <StyledValue>
              {new Date(log.timestamp).toLocaleString()}
            </StyledValue>
          </Grid>

          <Grid item xs={12} sm={6} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Type
            </StyledLabel>
            <StyledValue>
              {log.type}
            </StyledValue>
          </Grid>

          <Grid item xs={12} sm={6} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Status
            </StyledLabel>
            <StyledChip
              label={log.isAnomaly ? 'Anomaly' : 'Normal'}
              color={log.isAnomaly ? 'secondary' : 'default'}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              IP Address
            </StyledLabel>
            <StyledValue>
              {log.ip}
            </StyledValue>
          </Grid>

          <Grid item xs={12} sm={6} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Location
            </StyledLabel>
            <StyledValue>
              {log.location ? (
                `${log.location.city}, ${log.location.country}`
              ) : (
                'Unknown'
              )}
            </StyledValue>
          </Grid>

          {log.isAnomaly && (
            <Grid item xs={12} component={StyledSection}>
              <StyledLabel variant="subtitle2">
                Anomaly Details
              </StyledLabel>
              {log.anomalies.map((anomaly, index) => (
                <StyledChip
                  key={index}
                  label={anomaly}
                  color="secondary"
                  size="small"
                />
              ))}
            </Grid>
          )}

          <Grid item xs={12} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Raw Data
            </StyledLabel>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(log, null, 2)}
            </pre>
          </Grid>

          <Grid item xs={12} component={StyledSection}>
            <StyledLabel variant="subtitle2">
              Blockchain Verification
            </StyledLabel>
            <Chip
              label={verificationStatus ? "Verified" : "Unverified"}
              color={verificationStatus ? "success" : "error"}
            />
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