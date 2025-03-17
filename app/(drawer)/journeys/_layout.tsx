import { Stack } from 'expo-router';

export default function JourneysLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'New Journey',
        }}
      />
    </Stack>
  );
}