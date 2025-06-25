import React, { useState } from 'react';
import './LegalForm.css';

const LegalForm = ({ onSubmit }) => {
  const [legalQuestion, setLegalQuestion] = useState('');
  const [country, setCountry] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!legalQuestion.trim()) {
      errors.legalQuestion = 'Please enter your legal question';
    }
    
    if (!country) {
      errors.country = 'Please select your country';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        legalQuestion: legalQuestion.trim(),
        country
      });
    }
  };

  return (
    <form id="legalForm" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="legalQuestion">What's your legal question?</label>
        <textarea 
          id="legalQuestion" 
          name="legalQuestion" 
          rows="5" 
          placeholder="Enter your legal question here..." 
          value={legalQuestion}
          onChange={(e) => setLegalQuestion(e.target.value)}
          className={formErrors.legalQuestion ? 'error' : ''}
        />
        {formErrors.legalQuestion && (
          <div className="error-text">{formErrors.legalQuestion}</div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="country">Select your country</label>
        <select 
          id="country" 
          name="country" 
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className={formErrors.country ? 'error' : ''}
        >
          <option value="" disabled>Choose your country</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Spain">Spain</option>
          <option value="Italy">Italy</option>
          <option value="Japan">Japan</option>
          <option value="China">China</option>
          <option value="India">India</option>
          <option value="Brazil">Brazil</option>
          <option value="Mexico">Mexico</option>
          <option value="South Africa">South Africa</option>
          <option value="Russia">Russia</option>
        </select>
        {formErrors.country && (
          <div className="error-text">{formErrors.country}</div>
        )}
      </div>
      
      <button type="submit" className="submit-btn">Get Legal Advice</button>
    </form>
  );
};

export default LegalForm;