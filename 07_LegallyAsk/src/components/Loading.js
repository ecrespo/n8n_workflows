import React from 'react';
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Processing your request...</p>
    </div>
  );
};

export default Loading;