import axios from 'axios';

const API_URL = 'http://localhost/auth';

async function testAuthAPI() {
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResponse = await axios.post(`${API_URL}/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Registration response:', registerResponse.data);

    // Test login
    console.log('\nTesting login...');
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);

    const token = loginResponse.data.token;

    // Test check-token
    console.log('\nTesting check-token...');
    const checkTokenResponse = await axios.get(`${API_URL}/check-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Check token response:', checkTokenResponse.data);

    // Test get current user
    console.log('\nTesting get current user...');
    const userResponse = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current user response:', userResponse.data);

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuthAPI(); 