import React, { useEffect, useState } from 'react';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { NotificationService } from '../services/NotificationService';

function Notifications() {
  const [notification, setNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const subscription = NotificationService.onNotification().subscribe(
      (notif) => {
        setNotification(notif);
        setOpen(true);
      }
    );

    return () => subscription.unsubscribe();
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