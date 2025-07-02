// app/(admin)/AdminLayout.tsx
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { SignOutButton } from "@/components/SignOutButton";
import { useState } from "react";
import { styles } from "@/assets/styles/admin.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import AdminSidebar from "@/components/AdminSideBar";
import { COLORS } from "@/constants/colors";

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
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
                <Text style={styles.welcomeText}>Admin Panel,</Text>
                <Text style={styles.usernameText}>
                  {user?.username ||
                    user?.emailAddresses[0]?.emailAddress ||
                    "Admin"}
                </Text>
              </View>
            </View>
            <View style={styles.headerCenter}>
              <Image
                source={require("@/assets/images/YarSuLogo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerRight}>
              <SignOutButton />
            </View>
          </View>
          <View style={styles.contentContainer}>{children}</View>
        </View>
      </SignedIn>
      <SignedOut>
        <Redirect href={"/(auth)"} />
      </SignedOut>
    </View>
  );
}
