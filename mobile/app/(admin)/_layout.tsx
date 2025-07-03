// app/(admin)/_layout.tsx
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import AdminLayout from "@/components/AdminLayout";
import { Stack } from "expo-router/stack";

function AdminLayoutWrapper() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.publicMetadata?.role !== "admin") {
      router.replace("/(root)");
    }
  }, [user, router]);

  return null; // This component only handles redirection
}

export default function AdminAppLayout() {
  return (
    <AdminLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="adminjob" />
        <Stack.Screen name="admincondo" />
      </Stack>
      <AdminLayoutWrapper /> {/* Add redirection logic here */}
    </AdminLayout>
  );
}
