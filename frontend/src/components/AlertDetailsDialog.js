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
  Box,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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

const SeverityIcon = styled('span')(({ theme, severity }) => ({
  marginRight: theme.spacing(1),
  color: severity === 'high' 
    ? theme.palette.error.main 
    : severity === 'medium'
    ? theme.palette.warning.main
    : theme.palette.info.main,
}));

function AlertDetailsDialog({ alert, onClose, onAcknowledge }) {
  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <ErrorIcon />;
      case 'medium':
        return <WarningIcon />;
      case 'low':
        return <InfoIcon />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <SeverityIcon severity={alert.severity}>
            {getSeverityIcon(alert.severity)}
          </SeverityIcon>
          Alert Details - {alert.type}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <StyledSection>
            <StyledLabel variant="subtitle2">
              Timestamp
            </StyledLabel>
            <StyledValue>
              {new Date(alert.timestamp).toLocaleString()}
            </StyledValue>
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Severity
            </StyledLabel>
            <StyledChip
              label={alert.severity}
              color={alert.severity.toLowerCase() === 'high' ? 'secondary' : 'default'}
              size="small"
            />
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Status
            </StyledLabel>
            <StyledChip
              label={alert.status}
              color={alert.status === 'acknowledged' ? 'primary' : 'default'}
              size="small"
            />
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Description
            </StyledLabel>
            <StyledValue>
              {alert.description}
            </StyledValue>
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Source IP
            </StyledLabel>
            <StyledValue>
              {alert.sourceIp}
            </StyledValue>
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Location
            </StyledLabel>
            <StyledValue>
              {alert.location ? (
                `${alert.location.city}, ${alert.location.country}`
              ) : (
                'Unknown'
              )}
            </StyledValue>
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Affected Resources
            </StyledLabel>
            {alert.affectedResources?.map((resource, index) => (
              <StyledChip
                key={index}
                label={resource}
                size="small"
              />
            ))}
          </StyledSection>

          <StyledSection>
            <StyledLabel variant="subtitle2">
              Raw Data
            </StyledLabel>
            <pre style={{ overflow: 'auto' }}>
              {JSON.stringify(alert.rawData || alert, null, 2)}
            </pre>
          </StyledSection>
        </Grid>
      </DialogContent>
      <DialogActions>
        {alert.status !== 'acknowledged' && (
          <Button onClick={() => onAcknowledge(alert._id)} color="primary">
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