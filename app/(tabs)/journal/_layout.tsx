import { Stack } from 'expo-router';

export default function JournalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          presentation: 'modal',
          title: 'New Journal Entry',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Journal Entry',
        }}
      />
    </Stack>
  );
}