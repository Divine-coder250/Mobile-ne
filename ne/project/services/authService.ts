// src/services/authService.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import api from './api';

// User type definition
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// Keys for storing auth data
const TOKEN_KEY = 'finance_tracker_token';
const USER_KEY = 'finance_tracker_user';

// Helper for web storage when SecureStore is not available
const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};

// Storage adapter based on platform
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

// Store the authentication token
export async function storeToken(token: string): Promise<void> {
  await storage.setItemAsync(TOKEN_KEY, token);
}

// Get the stored authentication token
export async function getToken(): Promise<string | null> {
  return await storage.getItemAsync(TOKEN_KEY);
}

// Remove the stored authentication token
export async function removeToken(): Promise<void> {
  await storage.deleteItemAsync(TOKEN_KEY);
}

// Store user data
export async function storeUser(user: User): Promise<void> {
  await storage.setItemAsync(USER_KEY, JSON.stringify(user));
}

// Get the stored user data
export async function getUser(): Promise<User | null> {
  const data = await storage.getItemAsync(USER_KEY);
  return data ? JSON.parse(data) : null;
}

// Remove the stored user data
export async function removeUser(): Promise<void> {
  await storage.deleteItemAsync(USER_KEY);
}

// Login function
export async function login(username: string, password: string): Promise<User> {
  try {
    // First, search for users with the provided username
    const response = await api.get(`/users?username=${encodeURIComponent(username)}`);
    
    const users = response.data;
    
    // Check if user exists and the password matches
    const user = users.find((u: any) => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Store user info and token (using user ID as a simple token)
    await storeToken(user.id);
    await storeUser(user);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout function
export async function logout(): Promise<void> {
  await removeToken();
  await removeUser();
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}