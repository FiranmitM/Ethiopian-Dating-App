// // index.js
// require('dotenv').config();
// const express = require('express');
// const app = express();
// const db = require('./db');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const session = require('express-session');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static('build'));
// app.use('/images', express.static('./images'));
// app.use(session({ secret: 'matchac2r2p6', saveUninitialized: true, resave: true }));

// // HTTP Server + Socket.IO
// const http = require('http').Server(app);
// const socketIO = require('socket.io')(http, {
// 	cors: {
// 		origin: "http://localhost:3000",
// 	}
// });

// // Confirm MySQL DB connection
// db.query('SELECT 1', (err, results) => {
// 	if (err) {
// 		console.error('❌ MySQL DB connection error:', err);
// 	} else {
// 		console.log('✅ MySQL DB connection verified.');
// 	}
// });

// // Email setup
// const transporter = nodemailer.createTransport({
// 	service: 'gmail',
// 	auth: {
// 		user: process.env.EMAIL_ADDRESS,
// 		pass: process.env.EMAIL_PASSWORD
// 	}
// });

// // Image upload setup
// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'images/');
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
// 	}
// });
// const upload = multer({ storage: storage });

// // Route registration
// require('./routes/signup.js')(app, db, bcrypt, transporter);
// require('./routes/login_logout.js')(app, db, bcrypt);
// require('./routes/resetpassword.js')(app, db, bcrypt, transporter);
// require('./routes/profile.js')(app, db, upload, fs, path, bcrypt);
// require('./routes/browsing.js')(app, db, transporter, socketIO);
// require('./routes/chat.js')(db, socketIO);
// require('./routes/chat_api.js')(app, db);

// // Start server
// const PORT = process.env.PORT || 3001;
// http.listen(PORT, () => {
// 	console.log(`🚀 Server listening on http://localhost:${PORT}`);
// });
// Load environment variables
require('dotenv').config();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const socketIO = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000", // Allow React dev server
    methods: ["GET", "POST"],
    credentials: true
  }
});

const cors = require('cors');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const db = require('./db');

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('build'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'matchac2r2p6',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ✅ Database Connection
db.query('SELECT 1', (err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ MySQL connection established');
});

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD
  }
});

// ✅ Multer File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ✅ Routes Setup
require('./routes/signup')(app, db, bcrypt, transporter);
require('./routes/login_logout')(app, db, bcrypt);
require('./routes/resetpassword')(app, db, bcrypt, transporter);
require('./routes/profile')(app, db, upload, fs, path, bcrypt);
require('./routes/browsing')(app, db, transporter, socketIO);
require('./routes/chat')(db, socketIO);
require('./routes/chat_api')(app, db);

// ✅ Socket.IO Events
socketIO.on('connection', (socket) => {
  console.log(`EDA: ${socket.id} user just connected!`);

  socket.on('newUser', (data) => {
    socket.broadcast.emit('newUserResponse', data);
  });

  socket.on('disconnect', () => {
    console.log('EDA: A user disconnected');
  });
});

// ✅ Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
