const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

// Parse JSON request bodies
app.use(express.json());

// Store for webhook responses
const webhookResponses = {};

// Handle API requests
app.post('/api/submit-question', async (req, res) => {
  try {
    const { requestId, legalQuestion, country } = req.body;

    // Initialize responses array for this request ID
    webhookResponses[requestId] = [];

    // Forward the request to the webhook URL
    const webhookUrl = 'https://integrador.seraph13.dev/webhook-test/338b86b2-9277-44e7-9f84-1020734793ee';

    console.log(`Sending POST request to webhook URL: ${webhookUrl}`);
    console.log(`Request data: ${JSON.stringify({ requestId, legalQuestion, country })}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requestId, legalQuestion, country })
    });

    // Check content type to determine how to process the response
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      // Parse as JSON if content type is JSON
      data = await response.json();
    } else {
      // Handle as text for non-JSON responses
      const textData = await response.text();
      data = { 
        text: textData,
        isTextResponse: true 
      };
      console.log(`Received text response from webhook: ${textData}`);
    }

    console.log(`Processed response from webhook`);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Endpoint to receive webhook responses
app.post('/api/webhook-response', (req, res) => {
  try {
    const response = req.body;

    // Validate the response
    if (!response.requestId) {
      return res.status(400).json({ error: 'Missing requestId in webhook response' });
    }

    console.log(`Received webhook response for requestId: ${response.requestId}`);
    console.log(`Response data: ${JSON.stringify(response)}`);

    // Store the response
    if (webhookResponses[response.requestId]) {
      // Add timestamp if not provided
      if (!response.timestamp) {
        response.timestamp = new Date().toISOString();
      }

      webhookResponses[response.requestId].push(response);
    } else {
      console.warn(`Received response for unknown requestId: ${response.requestId}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook response:', error);
    res.status(500).json({ error: 'An error occurred while processing the webhook response' });
  }
});

// Endpoint to get webhook responses for a specific request
app.get('/api/webhook-responses/:requestId', (req, res) => {
  const { requestId } = req.params;

  if (webhookResponses[requestId]) {
    res.json(webhookResponses[requestId]);
  } else {
    res.json([]);
  }
});

// Serve the React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
