import { Subject } from 'rxjs';

const notificationSubject = new Subject();

export const NotificationService = {
  notify: (message, type = 'info') => {
    notificationSubject.next({ message, type });
  },
  onNotification: () => notificationSubject.asObservable(),
  success: (message) => NotificationService.notify(message, 'success'),
  error: (message) => NotificationService.notify(message, 'error'),
  warning: (message) => NotificationService.notify(message, 'warning'),
  info: (message) => NotificationService.notify(message, 'info'),
}; 