import { router, Stack } from "expo-router";
import { useUser } from "@clerk/clerk-expo"; // Changed from useAuth
import { useEffect } from "react";
import SafeScreen from "@/components/SafeScreen"; // Assuming you have this component

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(root)"); // Redirect to root if signed in
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null; // Or a loading component
  }

  if (isSignedIn) {
    return null; // Redirect handled by useEffect
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
