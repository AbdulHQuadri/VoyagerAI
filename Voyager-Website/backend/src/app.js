require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tasksRoute = require('./routes/tasks')

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Odyssey. The key to the world!' });
});

app.use('/api', tasksRoute)
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

