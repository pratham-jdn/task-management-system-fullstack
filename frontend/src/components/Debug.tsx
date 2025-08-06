import React from 'react';

const Debug: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'black', 
      color: 'white', 
      padding: '10px',
      fontSize: '12px',
      zIndex: 9999 
    }}>
      <div>API_URL: {process.env.REACT_APP_API_URL || 'NOT SET'}</div>
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default Debug;