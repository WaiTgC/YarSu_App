// app/(admin)/_layout.tsx
import { Stack } from "expo-router";
import AdminLayout from "@/components/AdminLayout";

export default function AdminLayoutRouter() {
  return (
    <AdminLayout>
      <Stack
        screenOptions={{
          headerShown: false, // Use custom header from AdminLayout
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        {/* Add other admin routes here as needed (e.g., job, home, travel) */}
      </Stack>
    </AdminLayout>
  );
}
