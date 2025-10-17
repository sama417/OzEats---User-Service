const request = require('supertest');
const app = require('../app');
const { addUser, findUserByEmail } = require('../usersData');
const { generateToken } = require('../auth');

describe('User Service API', () => {
  let user1Id, user2Id;
  let prefId;
  let user1Token, user2Token;

  beforeAll(async () => {
    // Create two users for testing
    const user1 = await addUser({ name: 'User 1', email: 'user1@example.com', password: 'password123' });
    user1Id = user1.id;
    user1Token = generateToken(user1);
    const user2 = await addUser({ name: 'User 2', email: 'user2@example.com', password: 'password456' });
    user2Id = user2.id;
    user2Token = generateToken(user2);
  });

  test('POST /users should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: 'New User', email: 'new@example.com', password: 'pass123' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('New User');
    expect(response.body).not.toHaveProperty('password');
  });

  test('POST /login should return a token for valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'user1@example.com', password: 'password123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /login should fail for invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'user1@example.com', password: 'wrong' });
    expect(response.status).toBe(401);
  });

  test('GET /users should return all users with valid token', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${user1Token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('GET /users/:id should retrieve own user with valid token', async () => {
    const response = await request(app)
      .get(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(user1Id);
  });

  test('GET /users/:id should fail for another user’s ID', async () => {
    const response = await request(app)
      .get(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden: Can only access own profile');
  });

  test('PUT /users/:id should update own user with valid token', async () => {
    const response = await request(app)
      .put(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ email: 'updated1@example.com' });
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('updated1@example.com');
  });

  test('PUT /users/:id should fail for another user’s ID', async () => {
    const response = await request(app)
      .put(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ email: 'wrong@example.com' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden: Can only update own profile');
  });

  test('DELETE /users/:id should delete own user with valid token', async () => {
    const response = await request(app)
      .delete(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(response.status).toBe(204);
    const getResponse = await request(app)
      .get(`/users/${user1Id}`)
      .set('Authorization', `Bearer ${user1Token}`);
    expect(getResponse.status).toBe(404); // Token invalid after deletion
  });

  test('POST /users/:id/preferences should add a preference for own user', async () => {
    const response = await request(app)
      .post(`/users/${user2Id}/preferences`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ preference: 'vegetarian' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('prefId');
    prefId = response.body.prefId;
  });

  test('POST /users/:id/preferences should fail for another user’s ID', async () => {
    const response = await request(app)
      .post(`/users/${user2Id}/preferences`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ preference: 'vegan' });
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Forbidden: Can only modify own preferences');
  });

  test('PUT /users/:id/preferences/:prefId should update own preference', async () => {
    const response = await request(app)
      .put(`/users/${user2Id}/preferences/${prefId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ preference: 'vegan' });
    expect(response.status).toBe(200);
    expect(response.body.preference).toBe('vegan');
  });

  test('DELETE /users/:id/preferences/:prefId should delete own preference', async () => {
    const response = await request(app)
      .delete(`/users/${user2Id}/preferences/${prefId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(response.status).toBe(204);
    const getResponse = await request(app)
      .get(`/users/${user2Id}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(getResponse.body.preferences).not.toContainEqual(expect.objectContaining({ prefId }));
  });
});


nybroq-fanvo7-zoxvUj