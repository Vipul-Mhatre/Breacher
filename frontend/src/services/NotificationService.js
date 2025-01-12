class NotificationService {
  static listeners = [];

  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notify(message, type = 'info') {
    this.listeners.forEach(listener => listener({ message, type }));
  }

  static success(message) {
    this.notify(message, 'success');
  }

  static error(message) {
    this.notify(message, 'error');
  }

  static warning(message) {
    this.notify(message, 'warning');
  }

  static info(message) {
    this.notify(message, 'info');
  }
}

export { NotificationService }; 