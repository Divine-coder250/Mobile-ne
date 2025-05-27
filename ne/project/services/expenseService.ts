import api from './api';
import { Expense, NewExpense } from '@/types';

// Get all expenses
export async function getExpenses(): Promise<Expense[]> {
  try {
    const response = await api.get('/expenses');
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

// Get expense by ID
export async function getExpenseById(id: string): Promise<Expense> {
  try {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense with ID ${id}:`, error);
    throw error;
  }
}

// Create a new expense
export async function createExpense(expenseData: NewExpense): Promise<Expense> {
  try {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

// Update an expense
export async function updateExpense(id: string, expenseData: Partial<NewExpense>): Promise<Expense> {
  try {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating expense with ID ${id}:`, error);
    throw error;
  }
}

// Delete an expense
export async function deleteExpense(id: string): Promise<void> {
  try {
    await api.delete(`/expenses/${id}`);
  } catch (error) {
    console.error(`Error deleting expense with ID ${id}:`, error);
    throw error;
  }
}