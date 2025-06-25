import React from 'react';
import './Response.css';

const Response = ({ success, message }) => {
  return (
    <div className="response">
      <div className={success ? "success-message" : "error-message"}>
        <h3>{success ? "Request Submitted" : "Error"}</h3>
        <p>{message}</p>
        {success && (
          <p className="note">You may receive a response via email or through this interface shortly.</p>
        )}
      </div>
    </div>
  );
};

export default Response;