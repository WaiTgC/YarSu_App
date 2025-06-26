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
import AppSidebar from "@/components/AppSidebar";
import { COLORS } from "@/constants/colors";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <View style={styles.container}>
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={toggleSidebar}
              style={styles.sidebarTrigger}
            >
              <Ionicons name="menu" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/YarSu.svg")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.username || user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("./create")}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>
        <View style={styles.contentContainer}>{children}</View>
      </View>
    </View>
  );
}
