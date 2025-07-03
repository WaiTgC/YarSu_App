import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AdminLayout from "@/components/AdminLayout";
import { Stack } from "expo-router/stack";

export default function AdminAppLayout() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && user.publicMetadata?.role !== "admin") {
      router.replace("/(root)");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return null; // Or a loading component
  }

  if (user && user.publicMetadata?.role !== "admin") {
    return null; // Redirect handled by useEffect, this prevents rendering
  }

  return (
    <AdminLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="adminjob" />
        <Stack.Screen name="admincondo" />
      </Stack>
    </AdminLayout>
  );
}
