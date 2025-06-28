import AppLayout from "@/components/AppLayout";
import { Stack } from "expo-router/stack";

export default function Layout() {
  return (
    <AppLayout>
      <Stack screenOptions={{ headerShown: false }} />
    </AppLayout>
  );
}
