import { Platform } from "react-native";

export const storeItem = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  }
};

export const getItem = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    const SecureStore = await import("expo-secure-store");
    return await SecureStore.getItemAsync(key);
  }
};
