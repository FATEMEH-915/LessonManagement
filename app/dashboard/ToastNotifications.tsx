import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

export const ToastNotifications = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        className: '',
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#4BB543',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#4BB543',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#FF3333',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#FF3333',
          },
        },
      }}
    />
  );
};

export default ToastNotifications;

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#4BB543',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#4BB543',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-center',
    style: {
      background: '#FF3333',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#FF3333',
    },
  });
};