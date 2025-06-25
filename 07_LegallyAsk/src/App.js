import React, { useState } from 'react';
import './App.css';
import LegalForm from './components/LegalForm';
import Loading from './components/Loading';
import Response from './components/Response';

function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const response = await fetch('/api/submit-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setError('There was an error processing your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="app-wrapper">
        <header>
          <h1>LegallyAsk</h1>
          <p>Your AI Legal Assistant</p>
        </header>
        
        <main>
          <LegalForm onSubmit={handleSubmit} />
        </main>
        
        {loading && <Loading />}
        
        {(response || error) && (
          <Response 
            success={response && !error} 
            message={error || "Your legal question has been submitted successfully. Our AI is analyzing your question."} 
          />
        )}
        
        <footer>
          <p>&copy; 2023 LegallyAsk. This is not a substitute for professional legal advice.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;