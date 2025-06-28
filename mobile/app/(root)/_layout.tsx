import AppLayout from "@/components/AppLayout";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <AppLayout>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="job" options={{ headerShown: false }} />
        {/* Add other routes like condo, course, etc., if needed */}
      </Stack>
    </AppLayout>
  );
}
