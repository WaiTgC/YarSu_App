import AppLayout from "@/components/AppLayout";
import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";

export default function RootLayout() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && user.publicMetadata?.role === "admin") {
      router.replace("/(admin)");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return null; // Or a loading component
  }

  if (user && user.publicMetadata?.role === "admin") {
    return null; // Redirect handled by useEffect
  }

  return (
    <AppLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="job" />
        <Stack.Screen name="travel" />
      </Stack>
    </AppLayout>
  );
}
