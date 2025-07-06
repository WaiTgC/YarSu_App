import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Text, View, FlatList, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/admin.styles";
import AdminCategoryGrid from "@/components/AdminCategoryGrid";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

interface DashboardProps {
  toggleSidebar: () => void;
}

export default function Dashboard({ toggleSidebar }: DashboardProps) {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.content}>
          <FlatList
            data={[{ key: "content" }]}
            renderItem={() => (
              <View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>
                    {getGreeting()},{" "}
                    {user?.username ||
                      user?.emailAddresses[0]?.emailAddress ||
                      "Admin"}
                    !
                  </Text>
                </View>
                <AdminCategoryGrid />
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.contentContainer}
          />
        </View>
      </SignedIn>
      <SignedOut>
        <Redirect href={"/(auth)"} />
      </SignedOut>
    </View>
  );
}
