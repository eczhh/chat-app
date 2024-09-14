const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
const corsOptions = {
  origin: 'http://localhost:4200',  // Allow requests from the Angular frontend
  optionsSuccessStatus: 200         // For legacy browser support
};
app.use(cors(corsOptions));

const userFilePath = 'users.json';
const groupFilePath = 'groups.json';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading users file');
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      res.status(200).send({ message: 'Login successful', user });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  });
});

// Helper function to log errors
function logError(err, reqType) {
  console.error(`[${reqType} Error]`, err);
}

// **Get all users** (Restored)
app.get('/api/users', (req, res) => {
  console.log('GET /api/users - Fetching all users');
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading users file');
    }
    res.send(JSON.parse(data));  // Return all users from users.json
  });
});

// Get all groups
app.get('/api/groups', (req, res) => {
  console.log('GET /api/groups - Fetching all groups');
  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }
    res.send(JSON.parse(data));
  });
});

// Create a new group
app.post('/api/groups', (req, res) => {
  const { groupName } = req.body;
  console.log('POST /api/groups - Creating new group:', groupName);

  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }

    const groups = JSON.parse(data);
    if (groups.find(group => group.groupName === groupName)) {
      return res.status(400).send('Group already exists');
    }

    const newGroup = { groupName, users: [], channels: [] };
    groups.push(newGroup);

    fs.writeFile(groupFilePath, JSON.stringify(groups), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving new group');
      }
      console.log('New group created successfully:', groupName);
      res.send(newGroup);
    });
  });
});

// Add a user to a group
app.post('/api/groups/:groupName/users', (req, res) => {
  const { groupName } = req.params;
  const { username } = req.body;
  console.log(`POST /api/groups/${groupName}/users - Adding user: ${username}`);

  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }

    const groups = JSON.parse(data);
    const group = groups.find(g => g.groupName === groupName);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    if (!group.users.includes(username)) {
      group.users.push(username);
    }

    fs.writeFile(groupFilePath, JSON.stringify(groups), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated group');
      }
      console.log(`User ${username} added to group ${groupName}`);
      res.send(group);
    });
  });
});

// Add a channel to a group
app.post('/api/groups/:groupName/channels', (req, res) => {
  const { groupName } = req.params;
  const { channelName } = req.body;
  console.log(`POST /api/groups/${groupName}/channels - Adding channel: ${channelName}`);

  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }

    const groups = JSON.parse(data);
    const group = groups.find(g => g.groupName === groupName);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    if (!group.channels.includes(channelName)) {
      group.channels.push(channelName);
    }

    fs.writeFile(groupFilePath, JSON.stringify(groups), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated group');
      }
      console.log(`Channel ${channelName} added to group ${groupName}`);
      res.send(group);
    });
  });
});

// Remove a user from a group
app.delete('/api/groups/:groupName/users/:username', (req, res) => {
  const { groupName, username } = req.params;
  console.log(`DELETE /api/groups/${groupName}/users/${username} - Removing user`);

  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }

    const groups = JSON.parse(data);
    const group = groups.find(g => g.groupName === groupName);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    group.users = group.users.filter(user => user !== username);

    fs.writeFile(groupFilePath, JSON.stringify(groups), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated group');
      }
      console.log(`User ${username} removed from group ${groupName}`);
      res.send(group);
    });
  });
});

// Remove a channel from a group
app.delete('/api/groups/:groupName/channels/:channelName', (req, res) => {
  const { groupName, channelName } = req.params;
  console.log(`DELETE /api/groups/${groupName}/channels/${channelName} - Removing channel`);

  fs.readFile(groupFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading groups file');
    }

    const groups = JSON.parse(data);
    const group = groups.find(g => g.groupName === groupName);

    if (!group) {
      return res.status(404).send('Group not found');
    }

    group.channels = group.channels.filter(channel => channel !== channelName);

    fs.writeFile(groupFilePath, JSON.stringify(groups), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated group');
      }
      console.log(`Channel ${channelName} removed from group ${groupName}`);
      res.send(group);
    });
  });
});

// Remove a user
app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  console.log(`DELETE /api/users/${username} - Removing user`);

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading users file');
    }

    let users = JSON.parse(data);
    const userExists = users.find(user => user.username === username);

    if (!userExists) {
      return res.status(404).send('User not found');
    }

    // Filter out the user to remove them
    users = users.filter(user => user.username !== username);

    fs.writeFile(userFilePath, JSON.stringify(users), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated users file');
      }
      console.log(`User ${username} removed successfully`);
      res.send({ message: `User ${username} removed` });
    });
  });
});


// Add a new user
// Add a new user with a role (default is "User")
app.post('/api/users', (req, res) => {
  const { username, email, password } = req.body;
  console.log('POST /api/users - Adding new user:', username);

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading users file');
    }

    const users = JSON.parse(data);
    if (users.find(user => user.username === username)) {
      console.log('User already exists:', username);
      return res.status(400).send('User already exists');
    }

    const newUser = { username, email, password, role: 'User' };  // Add default role
    users.push(newUser);

    fs.writeFile(userFilePath, JSON.stringify(users), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving new user');
      }
      console.log('New user added successfully:', username);
      res.send(newUser);
    });
  });
});

// Promote a user to Group Admin
app.put('/api/users/:username/promote', (req, res) => {
  const { username } = req.params;
  console.log(`PUT /api/users/${username}/promote - Promoting user to Group Admin`);

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading users file');
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.role = 'groupadmin';  // Update the role to Group Admin

    fs.writeFile(userFilePath, JSON.stringify(users), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated user');
      }
      console.log(`User ${username} promoted to Group Admin`);
      res.send(user);
    });
  });
});


// Demote a user to regular User
app.put('/api/users/:username/demote', (req, res) => {
  const { username } = req.params;
  console.log(`PUT /api/users/${username}/demote - Demoting user to User`);

  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      logError(err, 'File Read');
      return res.status(500).send('Error reading users file');
    }

    const users = JSON.parse(data);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.role = 'User';  // Update the role to regular User

    fs.writeFile(userFilePath, JSON.stringify(users), (err) => {
      if (err) {
        logError(err, 'File Write');
        return res.status(500).send('Error saving updated user');
      }
      console.log(`User ${username} demoted to User`);
      res.send(user);
    });
  });
});




// Start server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
