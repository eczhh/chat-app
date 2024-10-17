require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');

const User = require('./models/User');
const Group = require('./models/Group');
const Message = require('./models/Message'); // Import the Message model

const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app); // Create HTTP server
// const io = socketIo(server); // Attach Socket.io to server
const { ExpressPeerServer } = require('peer');


const jwt = require('jsonwebtoken');

const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
});

app.use('/peerjs', peerServer);

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST'],
  credentials: true,
}));



const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:4200', // Allow requests from this origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));


// Endpoint to handle file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ fileUrl });
});


// Middleware
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://localhost:4200', // Allow requests from the Angular frontend
  optionsSuccessStatus: 200,       // For legacy browser support
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Helper function to log errors
function logError(err, reqType) {
  console.error(`[${reqType} Error]`, err);
}

/**
 * User Routes
 */
// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username and password
    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, '12345', { expiresIn: '1h' });

    // Send the token and user information back to the client
    res.status(200).json({
      message: 'Login successful',
      token, // Return the JWT token to the client
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error during login');
  }
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, '12345', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}



// Get message history between authenticated user and another user
app.get('/api/messages/:withUsername', async (req, res) => {
  const { withUsername } = req.params;
  const currentUsername = req.query.currentUsername; // Get current user from query parameter

  if (!currentUsername || !withUsername) {
    return res.status(400).send('Both currentUsername and withUsername are required');
  }

  try {
    const currentUser = await User.findOne({ username: currentUsername });
    const withUser = await User.findOne({ username: withUsername });

    if (!currentUser || !withUser) {
      return res.status(404).send('User not found');
    }

    console.log('current_user', currentUser._id);
    console.log('receiver_user', withUser._id);

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: currentUser._id, receiver: withUser._id },
        { sender: withUser._id, receiver: currentUser._id },
      ],
    })
      .populate('sender', 'username profileImage')
      .populate('receiver', 'username profileImage')
      .sort('timestamp');

    console.log('messages', messages);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});






// Get all users
app.get('/api/users', async (req, res) => {
  console.log('GET /api/users - Fetching all users');
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    logError(err, 'Get Users');
    res.status(500).send('Error fetching users');
  }
});

// Add a new user
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('POST /api/users - Adding new user:', username);

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).send('User already exists');
    }

    user = new User({ username, email, password, role: 'User' });
    await user.save();
    console.log('New user added successfully:', username);
    res.status(201).json(user);
  } catch (err) {
    logError(err, 'Add User');
    res.status(500).send('Error adding new user');
  }
});

// Promote a user to Group Admin
app.put('/api/users/:username/promote', async (req, res) => {
  const { username } = req.params;
  console.log(`PUT /api/users/${username}/promote - Promoting user to Group Admin`);

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { role: 'groupadmin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(`User ${username} promoted to Group Admin`);
    res.json(user);
  } catch (err) {
    logError(err, 'Promote User');
    res.status(500).send('Error promoting user');
  }
});

// Demote a user to regular User
app.put('/api/users/:username/demote', async (req, res) => {
  const { username } = req.params;
  console.log(`PUT /api/users/${username}/demote - Demoting user to User`);

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { role: 'User' },
      { new: true }
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(`User ${username} demoted to User`);
    res.json(user);
  } catch (err) {
    logError(err, 'Demote User');
    res.status(500).send('Error demoting user');
  }
});

// Remove a user
app.delete('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  console.log(`DELETE /api/users/${username} - Removing user`);

  try {
    const user = await User.findOneAndDelete({ username });

    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(`User ${username} removed successfully`);
    res.json({ message: `User ${username} removed` });
  } catch (err) {
    logError(err, 'Remove User');
    res.status(500).send('Error removing user');
  }
});

/**
 * Group Routes
 */

// Get all groups
app.get('/api/groups', async (req, res) => {
  console.log('GET /api/groups - Fetching all groups');
  try {
    const groups = await Group.find({});
    res.json(groups);
  } catch (err) {
    logError(err, 'Get Groups');
    res.status(500).send('Error fetching groups');
  }
});

// Route to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from MongoDB
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
});


// Create a new group
app.post('/api/groups', async (req, res) => {
  const { groupName } = req.body;
  console.log('POST /api/groups - Creating new group:', groupName);

  try {
    // Check if group exists
    let group = await Group.findOne({ groupName });
    if (group) {
      return res.status(400).send('Group already exists');
    }

    group = new Group({ groupName, users: [], channels: [] });
    await group.save();
    console.log('New group created successfully:', groupName);
    res.status(201).json(group);
  } catch (err) {
    logError(err, 'Create Group');
    res.status(500).send('Error creating group');
  }
});

// Add a user to a group
app.post('/api/groups/:groupName/users', async (req, res) => {
  const { groupName } = req.params;
  const { username } = req.body;
  console.log(`POST /api/groups/${groupName}/users - Adding user: ${username}`);

  try {
    const group = await Group.findOne({ groupName });

    if (!group) {
      return res.status(404).send('Group not found');
    }

    if (!group.users.includes(username)) {
      group.users.push(username);
      await group.save();
    }

    console.log(`User ${username} added to group ${groupName}`);
    res.json(group);
  } catch (err) {
    logError(err, 'Add User to Group');
    res.status(500).send('Error adding user to group');
  }
});

// Add a channel to a group
app.post('/api/groups/:groupName/channels', async (req, res) => {
  const { groupName } = req.params;
  const { channelName } = req.body;
  console.log(`POST /api/groups/${groupName}/channels - Adding channel: ${channelName}`);

  try {
    const group = await Group.findOne({ groupName });

    if (!group) {
      return res.status(404).send('Group not found');
    }

    if (!group.channels.includes(channelName)) {
      group.channels.push(channelName);
      await group.save();
    }

    console.log(`Channel ${channelName} added to group ${groupName}`);
    res.json(group);
  } catch (err) {
    logError(err, 'Add Channel to Group');
    res.status(500).send('Error adding channel to group');
  }
});

// Remove a user from a group
app.delete('/api/groups/:groupName/users/:username', async (req, res) => {
  const { groupName, username } = req.params;
  console.log(`DELETE /api/groups/${groupName}/users/${username} - Removing user`);

  try {
    const group = await Group.findOne({ groupName });

    if (!group) {
      return res.status(404).send('Group not found');
    }

    group.users = group.users.filter(user => user !== username);
    await group.save();

    console.log(`User ${username} removed from group ${groupName}`);
    res.json(group);
  } catch (err) {
    logError(err, 'Remove User from Group');
    res.status(500).send('Error removing user from group');
  }
});

// Remove a channel from a group
app.delete('/api/groups/:groupName/channels/:channelName', async (req, res) => {
  const { groupName, channelName } = req.params;
  console.log(`DELETE /api/groups/${groupName}/channels/${channelName} - Removing channel`);

  try {
    const group = await Group.findOne({ groupName });

    if (!group) {
      return res.status(404).send('Group not found');
    }

    group.channels = group.channels.filter(channel => channel !== channelName);
    await group.save();

    console.log(`Channel ${channelName} removed from group ${groupName}`);
    res.json(group);
  } catch (err) {
    logError(err, 'Remove Channel from Group');
    res.status(500).send('Error removing channel from group');
  }
});

// Remove a group
app.delete('/api/groups/:groupName', async (req, res) => {
  const { groupName } = req.params;
  console.log(`DELETE /api/groups/${groupName} - Removing group`);

  try {
    const group = await Group.findOneAndDelete({ groupName });

    if (!group) {
      return res.status(404).send('Group not found');
    }

    console.log(`Group ${groupName} removed successfully`);
    res.json({ message: `Group ${groupName} removed` });
  } catch (err) {
    logError(err, 'Remove Group');
    res.status(500).send('Error removing group');
  }
});

app.post('/api/messages', async (req, res) => {
  const { sender, receiver, content } = req.body;

  try {
    // Ensure sender and receiver are valid ObjectId references to the 'usrs' collection
    const message = new Message({
      sender,
      receiver,
      content,
    });

    // Save the message to the database
    await message.save();

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});



io.use((socket, next) => {
  console.log('Socket.io middleware triggered');
  try {
    const token = socket.handshake.query.token;
    console.log('Received token:', token);

    if (!token) {
      console.error('Authentication error: Token not provided');
      return next(new Error('Authentication error: Token not provided'));
    }

    // Verify the token
    const decoded = jwt.verify(token, '12345');
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    next(new Error('Authentication error'));
  }
});

let onlineUsers = {};
const peerIds = {};


io.on('connection', (socket) => {
  const username = socket.user.username;
  onlineUsers[username] = socket.id;
  console.log("User connected", socket.id);  // Ensure this is printed

  socket.on('login', (username) => {
    onlineUsers[username] = socket.id;
    console.log(`${username} logged in`);
    io.emit('online-users', Object.keys(onlineUsers));
  });

  // Handle peer ID
  socket.on('peer-id', (data) => {
    console.log('Received peer-id event:', data);
    peerIds[data.username] = data.peerId;
    io.emit('peer-ids', peerIds);
    console.log('Emitted peer-ids:', peerIds);
  });


  // Notify all clients about the updated online users
  io.emit('user connected', Object.keys(onlineUsers));

  // Handle incoming chat messages
  socket.on('chat message', async (data) => {
    const { sender, receiver, content } = data;
    console.log('Received chat message:', data); // Log received messages
    console.log('senderrrrrrrr', sender);
    console.log('receiverrrrrr', receiver);


    try {
      // Find sender and receiver by username
      const senderUser = await User.findOne({ username: sender });
      const receiverUser = await User.findOne({ username: receiver });


      if (!senderUser || !receiverUser) {
        return socket.emit('error', { message: 'Invalid sender or receiver' });
      }

      // Create a new message with sender and receiver ObjectIds
      const message = new Message({
        sender: senderUser._id,  // ObjectId of the sender
        receiver: receiverUser._id, // ObjectId of the receiver
        content,
        timestamp: new Date(),
      });

      await message.save();
      console.log('Message saved to DB:', message); // This should appear before the emit


      // Emit the message back to the sender and receiver
      socket.emit('chat message', { sender: senderUser.username, content, time: message.timestamp });

      const receiverSocketId = onlineUsers[receiverUser.username]; // Use username for lookup
      if (receiverSocketId) {
        console.log('receiverSocketId is not null', receiverSocketId);

        io.to(receiverSocketId).emit('chat message', {
          sender: senderUser.username,  // Pass the sender's username, not the ObjectId
          content,
          time: message.timestamp,
        });
      }
      else {
        console.log('receiverSocketId is null');
      }
    } catch (err) {
      console.error('Error saving chat message:', err);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove user from onlineUsers and peerIds
    for (const username in onlineUsers) {
      if (onlineUsers[username] === socket.id) {
        delete onlineUsers[username];
        delete peerIds[username];
        break;
      }
    }
    io.emit('online-users', Object.keys(onlineUsers));
    io.emit('peer-ids', peerIds);
  });
});



// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
