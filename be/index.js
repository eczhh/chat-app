// server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');
const User = require('./models/User');
const Group = require('./models/Group');

const app = express();

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
    const user = await User.findOne({ username, password }); // For now, plaintext password
    if (user) {
      res.status(200).send({ message: 'Login successful', user });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (err) {
    logError(err, 'Login');
    res.status(500).send('Server error during login');
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
