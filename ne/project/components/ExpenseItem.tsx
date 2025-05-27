import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '@/types';
import { DollarSign, Trash2 } from 'lucide-react-native';

interface ExpenseItemProps {
  expense: Expense;
  onPress: () => void;
  onDelete: () => void;
}

export default function ExpenseItem({ expense, onPress, onDelete }: ExpenseItemProps) {
  const formattedDate = new Date(expense.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const amount = parseFloat(expense.amount);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <DollarSign size={20} color="#14B8A6" />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.name} numberOfLines={1}>{expense.name}</Text>
        <Text style={styles.description} numberOfLines={1}>{expense.description}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 size={18} color="#f44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
});