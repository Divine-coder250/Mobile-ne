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
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getExpenses, deleteExpense } from '@/services/expenseService';
import ExpenseItem from '@/components/ExpenseItem';
import { Expense } from '@/types';
import { LineChart } from 'react-native-chart-kit';
import ExpenseSummary from '@/components/ExpenseSummary';
import { Trash2 } from 'lucide-react-native';
import { useCallback } from 'react';

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

      const lastExpenses = [...data].slice(0, 7).reverse();
      const chartLabels = lastExpenses.map((exp) => {
        const date = new Date(exp.createdAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      const chartValues = lastExpenses.map((exp) => parseFloat(exp.amount));

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

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleExpensePress = (id: string) => {
    router.push(`../expense/${id}`); // Updated to match new structure
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
              setExpenses(expenses.filter((expense) => expense.id !== id));
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Recent Expenses</Text>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 40}
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
          </View>

          <View style={styles.summaryContainer}>
            <ExpenseSummary expenses={expenses} />
          </View>

          <View style={styles.listHeaderContainer}>
            <Text style={styles.listTitle}>Recent Transactions</Text>
          </View>

          <FlatList
            data={expenses}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No expenses found</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push('/(tabs)/add-expense')}
                >
                  <Text style={styles.addButtonText}>Add New Expense</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Increased to clear tab bar (height: 60 + padding)
  },
  contentWrapper: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  chartWrapper: {
    overflow: 'hidden',
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  chart: {
    borderRadius: 8,
    alignSelf: 'center',
  },
  summaryContainer: {
    marginHorizontal: 10,
    marginTop: 20,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
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
