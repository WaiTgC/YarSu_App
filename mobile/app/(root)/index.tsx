import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState } from "react";
import { styles } from "@/assets/styles/home.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppSidebar from "@/components/AppSidebar";
import { COLORS } from "@/constants/colors";
import Home from "./home"; // Import Home component

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Use Home component as default content if no children are provided
  const defaultContent = <Home />;

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
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.username || user?.emailAddresses[0].emailAddress}
              </Text>
            </View>
          </View>
          <View style={styles.headerCenter}>
            <Image
              source={require("../../assets/images/YarSu.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerRight}>
            <SignOutButton />
          </View>
        </View>
        <View style={styles.contentContainer}>
          {children || defaultContent}
        </View>
      </View>
    </View>
  );
}
