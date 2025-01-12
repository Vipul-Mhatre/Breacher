import React, { useEffect, useState } from 'react';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';
import { NotificationService } from '../services/NotificationService';

function Notifications() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notif) => {
      setNotification(notif);
      setOpen(true);
    });

    return () => unsubscribe();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {notification && (
        <Alert onClose={handleClose} severity={notification.type}>
          {notification.message}
        </Alert>
      )}
    </Snackbar>
  );
}

export default Notifications; 