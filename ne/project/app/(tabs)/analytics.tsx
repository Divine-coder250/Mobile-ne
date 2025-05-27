import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getExpenses } from '@/services/expenseService';
import { Expense } from '@/types';
import { PieChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);

      const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      setTotalAmount(total);

      const categories: { [key: string]: number } = {};
      data.forEach(expense => {
        const category = expense.description;
        categories[category] = (categories[category] || 0) + parseFloat(expense.amount);
      });

      const colors = [
        '#14B8A6', '#0F766E', '#0D9488', '#059669', '#65A30D',
        '#84CC16', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
      ];

      const chartData = Object.keys(categories).map((category, index) => ({
        name: category,
        amount: categories[category],
        color: colors[index % colors.length],
      }));

      setPieChartData(chartData.length ? chartData : [
        {
          name: 'No Data',
          amount: 1,
          color: '#CCCCCC',
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#14B8A6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Expense Distribution</Text>

        <PieChart
          data={pieChartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={false}  // 🔥 disables built-in legend (just to be safe)
        />

        {/* Custom scrollable legend */}
        <ScrollView
          style={styles.legendScrollView}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          {pieChartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>
                {item.name} (${item.amount.toFixed(2)})
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Expense Breakdown</Text>

        {pieChartData.length > 0 && pieChartData[0].name !== 'No Data' ? (
          pieChartData.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={styles.breakdownCategory}>{item.name}</Text>
              </View>
              <Text style={styles.breakdownAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No expense data available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  legendScrollView: {
    maxHeight: 200,
    marginTop: 10,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownCategory: {
    fontSize: 16,
    color: '#333',
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
});
