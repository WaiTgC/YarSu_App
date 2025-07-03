// app/(root)/_layout.tsx
import AppLayout from "@/components/AppLayout";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";

function RootLayoutWrapper() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.publicMetadata?.role === "admin") {
      router.replace("/(admin)");
    }
  }, [user, router]);

  return null; // This component only handles redirection
}

export default function RootLayout() {
  return (
    <AppLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="job" />
        <Stack.Screen name="travel" />
      </Stack>
      <RootLayoutWrapper /> {/* Add redirection logic here */}
    </AppLayout>
  );
}
