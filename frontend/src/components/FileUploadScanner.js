import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  makeStyles,
  Box,
  Chip,
} from '@material-ui/core';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as SafeIcon,
  Warning as WarningIcon,
} from '@material-ui/icons';
import axios from 'axios';
import { API_URL } from '../config';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  uploadArea: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
  input: {
    display: 'none',
  },
  progress: {
    marginTop: theme.spacing(2),
  },
  fileList: {
    marginTop: theme.spacing(2),
  },
  safe: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.error.main,
  },
}));

function FileUploadScanner() {
  const classes = useStyles();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(
      event.dataTransfer ? event.dataTransfer.files : event.target.files
    );
    setFiles((prev) => [...prev, ...droppedFiles.map(prepareFile)]);
  };

  const prepareFile = (file) => ({
    file,
    id: Math.random().toString(36).substring(7),
    status: 'pending',
    scanResult: null,
  });

  const handleUpload = async (fileItem) => {
    const formData = new FormData();
    formData.append('file', fileItem.file);

    try {
      setUploading(true);
      const response = await axios.post(`${API_URL}/files/scan`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'scanned',
                scanResult: response.data.result,
              }
            : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: 'error',
                scanResult: { safe: false, threats: ['Scan failed'] },
              }
            : f
        )
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" gutterBottom>
        File Scanner
      </Typography>

      <div
        className={classes.uploadArea}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          className={classes.input}
          id="file-upload"
          multiple
          onChange={handleDrop}
        />
        <label htmlFor="file-upload">
          <Button
            component="span"
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
          >
            Upload Files
          </Button>
        </label>
        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
          or drag and drop files here
        </Typography>
      </div>

      {uploading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          className={classes.progress}
        />
      )}

      <List className={classes.fileList}>
        {files.map((fileItem) => (
          <ListItem key={fileItem.id}>
            <ListItemText
              primary={fileItem.file.name}
              secondary={
                <Box display="flex" alignItems="center">
                  {fileItem.status === 'scanned' && (
                    <>
                      {fileItem.scanResult.safe ? (
                        <SafeIcon className={classes.safe} />
                      ) : (
                        <WarningIcon className={classes.warning} />
                      )}
                      <Box ml={1}>
                        {fileItem.scanResult.safe ? (
                          <Chip
                            size="small"
                            label="Safe"
                            color="primary"
                          />
                        ) : (
                          fileItem.scanResult.threats.map((threat, index) => (
                            <Chip
                              key={index}
                              size="small"
                              label={threat}
                              color="secondary"
                              style={{ marginRight: 4 }}
                            />
                          ))
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              {fileItem.status === 'pending' ? (
                <Button
                  size="small"
                  onClick={() => handleUpload(fileItem)}
                  disabled={uploading}
                >
                  Scan
                </Button>
              ) : (
                <IconButton
                  edge="end"
                  onClick={() => handleRemove(fileItem.id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default FileUploadScanner; 