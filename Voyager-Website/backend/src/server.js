require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const chatRoutes = require('./routes/chatRoutes');
const lessonRoutes = require('./routes/lessonRoute');
const adminRoutes = require('./routes/adminRoutes');
const app = express(); 

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "voyager",
})

global.db = db;

// Middleware 
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

// Routes
app.get('/api' , (req, res) => {
    res.json({ message: 'Welcome to Odyssey. The key to the world!' });
})

app.use('/api/lessons' , lessonRoutes); 
app.use('/api/chat', chatRoutes); 
app.use('/api/admin', adminRoutes); 

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

app.post('/api/signup', async (req,res) => {
  try{
    const{ username, email, password, nativeLanguage, learningLanguage, proficiencyLevel } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields"});
    }

    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE username = ? or email = ?",
      [username, email]
    );

    if (existingUsers.length > 0){
      return res.status(409).json({message: "Username or email already exists"});
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, native_language, learning_language, proficiency_level) VALUES (?,?,?,?,?,?)" ,
      [username, email, hashedPassword, nativeLanguage, learningLanguage, proficiencyLevel]
    );

    const user = {
      id: result.insertId, 
      username, 
      nativeLanguage,
      learningLanguage,
      proficiencyLevel
    }; 

    const token = jwt.sign(
      {id: user.id, username: user.username},
      process.env.JWT_SECRET,
      {expiresIn: '24h'}
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        proficiencyLevel: user.proficiencyLevel
      }
    });
  } catch (error) {
    console.error("Signup error: ", error);
    res.status(500).json({message: "Server error during registration"});
  }
});


app.post('/api/login', async (req, res) => {
  try {
    // 1. Extract username and password
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    // 2. Look up user in database
    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // 3. Compare password hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 5. Return success response with token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        nativeLanguage: user.native_language,
        learningLanguage: user.learning_language,
        proficiencyLevel: user.proficiency_level
      }
    });
    
    // Update last activity timestamp
    await db.execute(
      'UPDATE users SET last_activity = NOW() WHERE user_id = ?',
      [user.user_id]
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Protected route example
app.get('/api/user-data', authenticateToken, async (req, res) => {
  try {
    // User ID is already attached from the authenticateToken middleware
    const userId = req.user.id;
    
    // Retrieve user data
    const [users] = await db.execute(
      'SELECT user_id, username, email, native_language, learning_language, proficiency_level, date_joined FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user progress data
    const [progress] = await db.execute(
      'SELECT lesson_id, current_stage, completed FROM user_progress WHERE user_id = ?',
      [userId]
    );
    
    // Return user data
    res.json({
      user: users[0],
      progress: progress
    });
  } catch (error) {
    console.error('User data error:', error);
    res.status(500).json({ message: 'Server error retrieving user data' });
  }
});

// Authentication middleware
function authenticateToken(req, res, next) {
  // 1. Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // 2. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    // 3. Attach user data to request
    req.user = user;
    
    // 4. Call next middleware
    next();
  });
}



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});