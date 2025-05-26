import axios from 'axios';

// Define the User interface
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'attendant';
}

// Base URL for JSONPlaceholder API
const API_URL = 'https://jsonplaceholder.typicode.com';

// Simulated password storage (in a real app, this would be secure and server-side)
const mockPasswords: { [email: string]: string } = {
  'sincere@april.biz': 'password123', // Example user from JSONPlaceholder
  'attendant@example.com': 'password123', // Additional mock user
};

// Function to fetch users and simulate login
export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    // Fetch all users from JSONPlaceholder
    const response = await axios.get(`${API_URL}/users`);
    const users = response.data;

    // Find user by email
    const userData = users.find((u: any) => u.email === email);

    if (!userData) {
      throw new Error('Invalid email or password');
    }

    // Simulate password check (in a real app, this would be an API endpoint)
    const storedPassword = mockPasswords[email];
    if (!storedPassword || storedPassword !== password) {
      throw new Error('Invalid email or password');
    }

    // Map JSONPlaceholder user data to our User interface
    // Assuming firstName and lastName are derived from name (e.g., "Leanne Graham" -> "Leanne" and "Graham")
    const [firstName, lastName] = userData.name.split(' ');
    const role: 'admin' | 'attendant' = email === 'sincere@april.biz' ? 'admin' : 'attendant'; // Assign role based on email

    const safeUser: User = {
      id: userData.id.toString(),
      firstName: firstName || userData.name,
      lastName: lastName || '',
      email: userData.email,
      role,
    };

    // Mock JWT token
    const token = `jwt-token-${Date.now()}-${userData.id}`;

    return {
      user: safeUser,
      token,
    };
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
};

// Function to simulate user registration
export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: 'admin' | 'attendant'
): Promise<{ user: User; token: string }> => {
  try {
    // Check if email already exists (fetch users to simulate)
    const response = await axios.get(`${API_URL}/users`);
    const existingUsers = response.data;
    if (existingUsers.some((u: any) => u.email === email)) {
      throw new Error('Email already exists');
    }

    // Simulate posting to JSONPlaceholder (data won't persist, but we get an ID)
    const registerResponse = await axios.post(`${API_URL}/posts`, {
      title: `${firstName} ${lastName}`,
      body: email,
      userId: existingUsers.length + 1,
    });

    const newUserId = registerResponse.data.id.toString();

    // Store the password in mockPasswords (in a real app, this would be hashed and stored server-side)
    mockPasswords[email] = password;

    const safeUser: User = {
      id: newUserId,
      firstName,
      lastName,
      email,
      role,
    };

    // Mock JWT token
    const token = `jwt-token-${Date.now()}-${newUserId}`;

    return {
      user: safeUser,
      token,
    };
  } catch (error) {
    console.error('Registration error:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
};