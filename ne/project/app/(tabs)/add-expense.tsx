
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createExpense } from '@/services/expenseService';

export default function AddExpenseScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name || name.trim() === '') {
      Alert.alert('Error', 'Expense name is required');
      return false;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Valid amount is required');
      return false;
    }
    return true;
  };

  const handleAddExpense = async () => {
    console.log('Adding expense:', { name, amount, description });
    if (!validate()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        name,
        amount,
        description: description || '',
      });

      // Clear the inputs
      setName('');
      setAmount('');
      setDescription('');

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Navigating to index');
            router.push('../(tabs)');
          },
        },
      ]);
    } catch (error) {
      const err = error as Error; // Type assertion
      console.error('Add expense failed:', err.message, err.stack);
      Alert.alert('Error', `Failed to add expense: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Expense Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <Text>Amount</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <Text>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={{ borderWidth: 1, padding: 10, marginBottom: 10 }} />
      <Button title={loading ? 'Adding...' : 'Add Expense'} onPress={handleAddExpense} disabled={loading} color="#14B8A6"/>
      {loading && <ActivityIndicator size="large" color="#14B8A6" style={{ marginTop: 10 }} />}
    </View>
  );
}
