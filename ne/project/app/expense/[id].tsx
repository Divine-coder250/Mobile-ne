import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getExpenseById, deleteExpense } from '@/services/expenseService';
import { Expense } from '@/types';
import { ArrowLeft, Calendar, DollarSign, FileText, Trash2 } from 'lucide-react-native';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getExpenseById(id.toString());
        setExpense(data);
      } catch (error) {
        console.error('Failed to fetch expense details:', error);
        Alert.alert(
          'Error',
          'Failed to load expense details. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            
            try {
              await deleteExpense(id.toString());
              Alert.alert('Success', 'Expense deleted successfully', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
              ]);
            } catch (error) {
              console.error('Failed to delete expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Expense not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = new Date(expense.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Details</Text>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={handleDelete}
        >
          <Trash2 size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.contentContainer}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>${parseFloat(expense.amount).toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <FileText size={20} color="#14B8A6" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{expense.name}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color="#14B8A6" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionContent}>{expense.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  amountContainer: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  amountLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  amount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  descriptionContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});