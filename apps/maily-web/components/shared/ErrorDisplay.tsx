import React from 'react';

interface ErrorDisplayProps {
  title: string;
  message: string;
  onReload?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message, onReload }) => {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1>{title}</h1>
      <p>{message}</p>
      {onReload && (
        <button
          onClick={onReload}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload
        </button>
      )}
    </main>
  );
};

export default ErrorDisplay; 