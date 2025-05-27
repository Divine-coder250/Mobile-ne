// User types
export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// Expense types
export interface Expense {
  id: string;
  name: string;
  amount: string;
  description: string;
  createdAt: string;
}

export interface NewExpense {
  name: string;
  amount: string;
  description: string;
}