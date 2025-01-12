import { Subject } from 'rxjs';

const subject = new Subject();

export const NotificationService = {
  notify: (message, type = 'info') => subject.next({ message, type }),
  onNotification: () => subject.asObservable(),
  success: (message) => NotificationService.notify(message, 'success'),
  error: (message) => NotificationService.notify(message, 'error'),
  warning: (message) => NotificationService.notify(message, 'warning'),
  info: (message) => NotificationService.notify(message, 'info'),
}; 