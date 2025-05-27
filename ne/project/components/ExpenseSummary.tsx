import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Expense } from '@/types';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export default function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  // Calculate total expenses
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  // Get highest expense
  const highestExpense = expenses.length
    ? expenses.reduce((prev, current) =>
        parseFloat(prev.amount) > parseFloat(current.amount) ? prev : current
      )
    : null;

  // Get today's expenses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.createdAt);
    expenseDate.setHours(0, 0, 0, 0);
    return expenseDate.getTime() === today.getTime();
  });
  
  const todayTotal = todayExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.summaryItem}>
        <Text style={styles.label}>Total Expenses</Text>
        <Text style={styles.value}>${totalAmount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.summaryItem}>
        <Text style={styles.label}>Today's Expenses</Text>
        <Text style={styles.value}>${todayTotal.toFixed(2)}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.summaryItem}>
        <Text style={styles.label}>Highest Expense</Text>
        <Text style={styles.value}>
          {highestExpense
            ? `$${parseFloat(highestExpense.amount).toFixed(2)}`
            : '$0.00'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryItem: {
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});