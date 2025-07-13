// app/(admin)/_layout.tsx
import AdminLayout from "@/components/AdminLayout";
import SafeScreen from "@/components/SafeScreen";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <SafeScreen>
      <AdminLayout>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminLayout>
    </SafeScreen>
  );
}
