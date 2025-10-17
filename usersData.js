const bcrypt = require('bcrypt');

let users = [];
let nextUserId = 1;
let nextPrefId = 1;

async function addUser(user) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = { id: nextUserId++, name: user.name, email: user.email, password: hashedPassword, preferences: [] };
  users.push(newUser);
  return { id: newUser.id, name: newUser.name, email: newUser.email, preferences: newUser.preferences };
}

function getUsers() {
  return users.map(({ password, ...user }) => user);
}

function getUserById(id) {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function updateUser(id, updates) {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email;
  if (updates.password) user.password = await bcrypt.hash(updates.password, 10);
  const { password, ...safeUser } = user;
  return safeUser;
}

function deleteUser(id) {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

function addPreference(userId, preference) {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  const newPref = { prefId: nextPrefId++, preference };
  user.preferences.push(newPref);
  return newPref;
}

function updatePreference(userId, prefId, updates) {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  const pref = user.preferences.find(p => p.prefId === prefId);
  if (!pref) return null;
  if (updates.preference) pref.preference = updates.preference;
  return pref;
}

function deletePreference(userId, prefId) {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  const index = user.preferences.findIndex(p => p.prefId === prefId);
  if (index === -1) return false;
  user.preferences.splice(index, 1);
  return true;
}

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  addPreference,
  updatePreference,
  deletePreference,
  findUserByEmail
};