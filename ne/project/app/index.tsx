import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getExpenses, deleteExpense } from '@/services/expenseService';
import ExpenseItem from '@/components/ExpenseItem';
import { Expense } from '@/types';
import { LineChart } from 'react-native-chart-kit';
import ExpenseSummary from '@/components/ExpenseSummary';
import { Trash2 } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState({
    labels: [''],
    datasets: [{ data: [0] }],
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      
      // Prepare chart data with the latest 7 expenses (or fewer if less available)
      const lastExpenses = [...data].slice(0, 7).reverse();
      const chartLabels = lastExpenses.map(exp => {
        const date = new Date(exp.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const chartValues = lastExpenses.map(exp => parseFloat(exp.amount));
      
      setChartData({
        labels: chartLabels.length ? chartLabels : ['No Data'],
        datasets: [{ data: chartValues.length ? chartValues : [0] }],
      });
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      Alert.alert('Error', 'Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleExpensePress = (id: string) => {
    router.push(`/expense/${id}`);
  };

  const handleDeleteExpense = async (id: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              setExpenses(expenses.filter(expense => expense.id !== id));
            } catch (error) {
              console.error('Failed to delete expense:', error);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpenseItem
      expense={item}
      onPress={() => handleExpensePress(item.id)}
      onDelete={() => handleDeleteExpense(item.id)}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recent Expenses</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 20}
          height={180}
          chartConfig={{
            backgroundColor: '#14B8A6',
            backgroundGradientFrom: '#14B8A6',
            backgroundGradientTo: '#0F766E',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#0F766E',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <ExpenseSummary expenses={expenses} />

      <View style={styles.listHeaderContainer}>
        <Text style={styles.listTitle}>Recent Transactions</Text>
      </View>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-expense')}
            >
              <Text style={styles.addButtonText}>Add New Expense</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    paddingLeft: 10,
  },
  chart: {
    borderRadius: 8,
    paddingRight: 20,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});