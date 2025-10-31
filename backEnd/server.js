const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PythonShell } = require('python-shell');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.post('/api/generate', async (req, res) => {
  try {
    const options = {
      mode: 'text',
      pythonPath: 'python3',
      scriptPath: './ml_model',
      args: []
    };

    PythonShell.run('generate_music.py', options).then(results => {
      // results is an array consisting of messages collected 
      // during execution of the Python script
      res.json({ 
        success: true,
        melody: results[0] // Assuming the Python script returns the melody as a string
      });
    });

  } catch (error) {
    console.error('Error generating music:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error generating music' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
