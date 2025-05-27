
import { Stack } from 'expo-router';

export default function ExpenseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        } as any, // Type assertion to bypass the error
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen name="[id]" options={{ title: 'Expense Details' }} />
    </Stack>
  );
}
