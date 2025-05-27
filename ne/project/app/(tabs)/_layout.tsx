
import { Tabs } from 'expo-router';
import { Home, PieChart, Plus, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          elevation: 5,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: 'Add Expense',
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expense/[id]"
        options={{
          href: null, // Hide from tab bar, but inherits it
          title: 'Expense Details',
        }}
      />
    </Tabs>
  );
}
