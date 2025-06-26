import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState } from "react";
import { styles } from "@/assets/styles/home.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppLayout from "./index";
import CategoryGrid from "@/components/CategoryGrid";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulate refresh
  };

  return (
    <AppLayout>
      <SignedIn>
        <View style={styles.container}>
          <View style={styles.content}>
            <FlatList
              data={[{ key: "category-grid" }]}
              renderItem={() => <CategoryGrid />}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              style={styles.contentContainer}
            />
          </View>
        </View>
      </SignedIn>
      <SignedOut>
        <View style={styles.container}>
          <Text style={styles.welcomeText}>
            Please sign in to view the home screen
          </Text>
        </View>
      </SignedOut>
    </AppLayout>
  );
}
