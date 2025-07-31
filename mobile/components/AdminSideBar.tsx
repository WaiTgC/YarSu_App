// import React, { useEffect, useRef, useState } from "react";
// import { useRouter } from "expo-router";
// import { Text, View, TouchableOpacity, Animated, Image } from "react-native";
// import { styles } from "@/assets/styles/adminstyles/Sidebar.styles";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { COLORS } from "@/constants/colors";
// import { supabase } from "@/libs/supabase";
// import { getUserRole } from "@/services/authService";
// import { SignOutButton } from "@/components/SignOutButton";
// import { useLanguage } from "@/context/LanguageContext"; // Import useLanguage

// interface AdminSidebarProps {
//   isOpen: boolean;
//   toggleSidebar: () => void;
// }

// export default function AdminSidebar({
//   isOpen,
//   toggleSidebar,
// }: AdminSidebarProps) {
//   const router = useRouter();
//   const { language, setLanguage } = useLanguage(); // Use context to get and set language
//   const [user, setUser] = useState<any>(null);
//   const [isSignedIn, setIsSignedIn] = useState(false);
//   const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

//   useEffect(() => {
//     Animated.timing(translateX, {
//       toValue: isOpen ? 0 : -250,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   }, [isOpen]);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session) {
//         setIsSignedIn(true);
//         getUserRole()
//           .then((userData) => {
//             setUser(userData);
//             if (userData.role !== "admin") {
//               router.replace("/(root)");
//             }
//           })
//           .catch((error) => {
//             console.error("Error fetching user role:", error);
//             setIsSignedIn(false);
//             router.replace("/(auth)");
//           });
//       } else {
//         setIsSignedIn(false);
//         setUser(null);
//         router.replace("/(auth)");
//       }
//     });
//   }, []);

//   const handleChangePassword = () => {
//     router.push("/change-password");
//     toggleSidebar();
//   };

//   const handleEditProfile = () => {
//     router.push("/edit-profile");
//     toggleSidebar();
//   };

//   const handleLanguageChange = (lang: "en" | "my") => {
//     setLanguage(lang); // Update the language in context
//     toggleSidebar(); // Close the sidebar after selection
//   };

//   // Function to strip domain from email
//   const getDisplayEmail = (email: string | undefined) => {
//     if (!email) return "Admin";
//     return email.split("@")[0]; // Returns the part before the @ symbol
//   };

//   return (
//     <>
//       {isOpen && (
//         <TouchableOpacity
//           style={{
//             position: "absolute",
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0,
//             backgroundColor: "rgba(0,0,0,0.3)",
//             zIndex: 99,
//           }}
//           onPress={toggleSidebar}
//           activeOpacity={1}
//         />
//       )}
//       <Animated.View
//         style={[
//           styles.sidebar,
//           {
//             transform: [{ translateX }],
//             width: 250,
//             position: "absolute",
//             top: 0,
//             bottom: 0,
//             left: 0,
//             zIndex: 100,
//             backgroundColor: COLORS.background,
//             shadowColor: COLORS.text,
//             shadowOffset: { width: 2, height: 0 },
//             shadowOpacity: 0.2,
//             shadowRadius: 4,
//             elevation: 5,
//           },
//         ]}
//       >
//         <View style={styles.sidebarHeader}>
//           {isSignedIn ? (
//             <View style={styles.userContainer}>
//               <View style={styles.avatar}>
//                 <Text style={styles.avatarText}>
//                   {user?.username?.slice(0, 2).toUpperCase() ||
//                     getDisplayEmail(user?.email)?.slice(0, 2).toUpperCase() ||
//                     "US"}
//                 </Text>
//               </View>
//               <View>
//                 <Text style={styles.welcomeText}>Welcome,</Text>
//                 <Text style={styles.usernameText}>
//                   {user?.username || getDisplayEmail(user?.email)}
//                 </Text>
//               </View>
//             </View>
//           ) : (
//             <Text style={styles.welcomeText}>Please sign in</Text>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
//             <Ionicons name="chevron-back" size={24} color={COLORS.text} />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.separator} />
//         <View style={styles.sidebarContent}>
//           <TouchableOpacity
//             style={styles.groupLabel}
//             onPress={() => router.push("/(admin)/dashboard")}
//           >
//             <Text style={styles.menuText}>Dashboard</Text>
//           </TouchableOpacity>
//           <View style={styles.sidebarGroup}>
//             <Text style={styles.groupLabel}>Account</Text>
//             <TouchableOpacity
//               style={styles.menuButton}
//               onPress={handleEditProfile}
//             >
//               <View style={styles.menuItemContent}>
//                 <Ionicons name="person" size={20} color={COLORS.shadow} />
//                 <Text style={styles.menuText}>Edit Profile</Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.menuButton}
//               onPress={handleChangePassword}
//             >
//               <View style={styles.menuItemContent}>
//                 <Ionicons name="lock-closed" size={20} color={COLORS.shadow} />
//                 <Text style={styles.menuText}>Change Password</Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.menuButton, styles.logoutButton]}>
//               <View style={styles.menuItemContent}>
//                 <SignOutButton />
//               </View>
//             </TouchableOpacity>
//             <View style={styles.lanButton}>
//               <TouchableOpacity onPress={() => handleLanguageChange("my")}>
//                 <Image
//                   source={require("@/assets/images/MY.png")}
//                   style={[styles.logo]}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//               <View style={styles.separatorcol} />
//               <TouchableOpacity onPress={() => handleLanguageChange("en")}>
//                 <Image
//                   source={require("@/assets/images/US.png")}
//                   style={[styles.logo]}
//                   resizeMode="contain"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Animated.View>
//     </>
//   );
// }
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Text, View, TouchableOpacity, Animated, Image } from "react-native";
import { styles } from "@/assets/styles/adminstyles/Sidebar.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { SignOutButton } from "@/components/SignOutButton";
import { useLanguage } from "@/context/LanguageContext";
import { useUser } from "@/context/UserContext";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AdminSidebar({
  isOpen,
  toggleSidebar,
}: AdminSidebarProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { profile } = useUser();
  const [user, setUser] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const translateX = useRef(new Animated.Value(isOpen ? 0 : -250)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSignedIn(true);
        getUserRole()
          .then((userData) => {
            setUser(userData);
            if (userData.role !== "admin") {
              router.replace("/(root)");
            }
          })
          .catch((error) => {
            console.error("Error fetching user role:", error);
            setIsSignedIn(false);
            router.replace("/(auth)");
          });
      } else {
        setIsSignedIn(false);
        setUser(null);
        router.replace("/(auth)");
      }
    });
  }, []);

  const handleChangePassword = () => {
    router.push("/change-password");
    toggleSidebar();
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
    toggleSidebar();
  };

  const handleLanguageChange = (lang: "en" | "my") => {
    setLanguage(lang);
    toggleSidebar();
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 99,
          }}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
            width: 250,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: COLORS.background,
            shadowColor: COLORS.text,
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        <View style={styles.sidebarHeader}>
          {isSignedIn ? (
            <View style={styles.userContainer}>
              <View style={styles.avatar}>
                {profile.imageUrl ? (
                  <Image
                    source={{ uri: profile.imageUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {profile.name.slice(0, 2).toUpperCase() || "US"}
                  </Text>
                )}
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.usernameText}>{profile.name}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.welcomeText}>Please sign in</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <View style={styles.sidebarContent}>
          <TouchableOpacity
            style={styles.groupLabel}
            onPress={() => router.push("/(admin)/dashboard")}
          >
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>
          <View style={styles.sidebarGroup}>
            <Text style={styles.groupLabel}>Account</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleEditProfile}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="person" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleChangePassword}
            >
              <View style={styles.menuItemContent}>
                <Ionicons name="lock-closed" size={20} color={COLORS.shadow} />
                <Text style={styles.menuText}>Change Password</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, styles.logoutButton]}>
              <View style={styles.menuItemContent}>
                <SignOutButton />
              </View>
            </TouchableOpacity>
            <View style={styles.lanButton}>
              <TouchableOpacity onPress={() => handleLanguageChange("my")}>
                <Image
                  source={require("@/assets/images/MY.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.separatorcol} />
              <TouchableOpacity onPress={() => handleLanguageChange("en")}>
                <Image
                  source={require("@/assets/images/US.png")}
                  style={[styles.logo]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
