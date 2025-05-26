import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { loginUser, registerUser } from '@/services/authService';
import { Alert } from 'react-native';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'attendant';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'admin' | 'attendant'
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (userJSON && token) {
          const parsedUser = JSON.parse(userJSON);
          if (
            parsedUser.id &&
            parsedUser.firstName &&
            parsedUser.lastName &&
            parsedUser.email &&
            (parsedUser.role === 'admin' || parsedUser.role === 'attendant')
          ) {
            setUser(parsedUser as User);
          } else {
            console.warn('Invalid stored user data, clearing storage');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Failed to load user', error);
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Calling loginUser with:', { email, password });
      const { user, token } = await loginUser(email, password);
      console.log('loginUser response:', { user, token });

      if (!user || typeof token !== 'string') {
        throw new Error('Invalid user or token data');
      }

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      console.log('Navigating to /(tabs)');
      router.replace('/(tabs)');
    } catch (error) {
      const err = error as Error; // Type assertion to Error
      console.error('Login failed:', err);
      Alert.alert('Login Error', err.message || 'An error occurred during login');
      throw err; // Re-throw to allow calling component to handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'admin' | 'attendant'
  ) => {
    setIsLoading(true);
    try {
      const { user, token } = await registerUser(firstName, lastName, email, password, role);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      setUser(user);
      router.replace('/(tabs)');
    } catch (error) {
      const err = error as Error; // Type assertion to Error
      console.error('Registration failed:', err);
      Alert.alert('Registration Error', err.message || 'An error occurred during registration');
      throw err; // Re-throw to allow calling component to handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
      router.replace('/login');
    } catch (error) {
      const err = error as Error; // Type assertion to Error
      console.error('Logout failed:', err);
      Alert.alert('Logout Error', 'An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}