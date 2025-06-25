# LegallyAsk - Legal AI Assistant

A React application that serves as a legal AI assistant, allowing users to submit legal questions and select their country.

## Project Structure

```
07_LegallyAsk/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LegalForm.js
│   │   ├── LegalForm.css
│   │   ├── Loading.js
│   │   ├── Loading.css
│   │   ├── Response.js
│   │   └── Response.css
│   ├── App.js
│   ├── App.css
│   └── index.js
├── server.js
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the project directory:
   ```
   cd 07_LegallyAsk
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode

1. Start the Node.js server:
   ```
   npm run dev
   ```

2. The server will start on port 3000. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Mode

1. Build the React application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

3. The server will start on port 3000 (or the port specified by the PORT environment variable). Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Features

- Modern, dark UI with a vibrant purple background
- Form for submitting legal questions
- Country selection dropdown
- Form validation
- Loading indicator during submission
- Success/error messages after submission
- Responsive design for all screen sizes

## How It Works

1. The user enters a legal question and selects their country
2. The application validates the form inputs
3. The data is sent to the server via an API endpoint
4. The server forwards the request to a webhook URL
5. The user receives a success message when the submission is complete

## Technologies Used

- React.js - Frontend framework
- Node.js - JavaScript runtime
- Express - Web server framework
- CSS - Styling