const express = require('express');
const { generateToken, verifyToken, comparePassword } = require('./auth');
const {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  addPreference,
  updatePreference,
  deletePreference,
  findUserByEmail
} = require('./usersData');

const app = express();
app.use(express.json());

// POST /users - Add a new user (no auth)
app.post('/users', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  const user = await addUser({ name, email, password });
  res.status(201).json(user);
});

// POST /login - Authenticate user
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = findUserByEmail(email);
  if (!user || !(await comparePassword(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.status(200).json({ token });
});

// GET /users - Get all users (protected, any authenticated user)
app.get('/users', verifyToken, (req, res) => {
  const users = getUsers();
  res.status(200).json(users);
});

// GET /users/:id - Get user by ID (protected, only own data)
app.get('/users/:id', verifyToken, (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only access own profile' });
  }
  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

// PUT /users/:id - Update user details (protected, only own data)
app.put('/users/:id', verifyToken, async (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only update own profile' });
  }
  const updates = req.body;
  const user = await updateUser(id, updates);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
});

// DELETE /users/:id - Delete a user (protected, only own data)
app.delete('/users/:id', verifyToken, (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only delete own profile' });
  }
  const success = deleteUser(id);
  if (!success) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(204).send();
});

// POST /users/:id/preferences - Add a preference (protected, only own data)
app.post('/users/:id/preferences', verifyToken, (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only modify own preferences' });
  }
  const { preference } = req.body;
  if (!preference) {
    return res.status(400).json({ error: 'Preference is required' });
  }
  const pref = addPreference(id, { preference });
  if (!pref) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(201).json(pref);
});

// PUT /users/:id/preferences/:prefId - Update a preference (protected, only own data)
app.put('/users/:id/preferences/:prefId', verifyToken, (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only modify own preferences' });
  }
  const prefId = parseInt(req.params.prefId);
  const updates = req.body;
  const pref = updatePreference(id, prefId, updates);
  if (!pref) {
    return res.status(404).json({ error: 'User or preference not found' });
  }
  res.status(200).json(pref);
});

// DELETE /users/:id/preferences/:prefId - Delete a preference (protected, only own data)
app.delete('/users/:id/preferences/:prefId', verifyToken, (req, res) => {
  const id = parseInt(req.params.id);
  if (id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: Can only modify own preferences' });
  }
  const prefId = parseInt(req.params.prefId);
  const success = deletePreference(id, prefId);
  if (!success) {
    return res.status(404).json({ error: 'User or preference not found' });
  }
  res.status(204).send();
});

module.exports = app;