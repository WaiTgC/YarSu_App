import { Redirect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Stack } from "expo-router/stack";

export default function Layout() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  } //This is for a better user experience.
  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
