import { Alert as RNAlert, Platform } from 'react-native';

export const Alert = {
  alert: (title: string, message?: string, buttons?: any[]) => {
    if (Platform.OS === 'web') {
      if (buttons && buttons.length > 0) {
        // If there's a destructive/ok button with an onPress, map it to confirm
        const confirmButton = buttons.find((b: any) => b.text?.toLowerCase() !== 'cancel');
        if (confirmButton && confirmButton.onPress) {
            const confirmed = window.confirm(`${title}\n${message || ''}`);
            if (confirmed) {
                confirmButton.onPress();
            }
            return;
        }
      }
      window.alert(`${title}\n${message || ''}`);
    } else {
      RNAlert.alert(title, message, buttons);
    }
  }
};
