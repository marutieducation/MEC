const testRegister = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@gmail.com`,
        password: 'password123',
        role: 'student',
        phone: '1234567890',
        city: 'Test City'
      })
    });
    const data = await res.json();
    console.log('Register Result:', data);
  } catch (err) {
    console.error('Register Error:', err);
  }
};

testRegister();
