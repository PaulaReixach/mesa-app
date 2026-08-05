import { Stack } from 'expo-router';

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
