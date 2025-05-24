// Simple connection test for React Native
const API_URL = 'http://192.168.1.11:8000';

// Test basic connectivity
fetch(`${API_URL}/`)
  .then(response => response.json())
  .then(data => {
    console.log('✅ Backend connection successful:', data);
  })
  .catch(error => {
    console.error('❌ Backend connection failed:', error);
  });

// Test login endpoint
const testLogin = async () => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', 'nurse@test.com');
    formData.append('password', 'password123');

    const response = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login test successful:', data.user);
    } else {
      const error = await response.text();
      console.error('❌ Login test failed:', error);
    }
  } catch (error) {
    console.error('❌ Login test error:', error);
  }
};

// Run tests
console.log('🧪 Testing backend connectivity...');
testLogin(); 