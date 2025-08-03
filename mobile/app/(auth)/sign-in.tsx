import { router } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styles } from "@/assets/styles/auth.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";
import { storeItem } from "@/utils/storage";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("SignIn - Supabase client:", !!supabase);
    if (!supabase) {
      console.error("SignIn - Supabase client is undefined");
      setError("Application error: Supabase client not initialized");
    }

    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSignInPress = async () => {
    setIsLoading(true);
    setError(""); // Clear previous errors
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized");
      }
      console.log("SignIn - Attempting sign-in:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("SignIn - Supabase auth error:", error.message);
        throw new Error(error.message);
      }
      if (data.session) {
        console.log("SignIn - Successful, user ID:", data.session.user.id);
        await storeItem("authToken", data.session.access_token || "");
        await storeItem("userId", data.session.user.id || "");
        console.log("SignIn - Stored userId:", data.session.user.id);
        console.log("SignIn - Stored authToken:", data.session.access_token);
        const user = await getUserRole();
        console.log("SignIn - User data:", user);
        console.log("SignIn - User role:", user.role);
        router.replace(
          user.role === "admin" ? "/(admin)/dashboard" : "/(root)/home"
        );
      } else {
        console.error("SignIn - No session returned");
        setError("Sign-in failed. Please check your credentials.");
      }
    } catch (err: any) {
      console.error("SignIn - Error:", err.message);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.containerbg} onStartShouldSetResponder={() => true}>
        <Animated.Text
          style={[styles.title, { transform: [{ translateX: shakeAnim }] }]}
        >
          Log In
        </Animated.Text>
        {error ? (
          <Animated.View
            style={[
              styles.errorBox,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError("")}
              onStartShouldSetResponder={() => true}
            >
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        <Animated.View
          style={[
            styles.animationslideupconatiner,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              autoCapitalize="none"
              value={email}
              placeholder="✉ Enter email"
              placeholderTextColor="#9A8478"
              onChangeText={(email) => setEmail(email)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              value={password}
              placeholder="🔒 Enter password"
              placeholderTextColor="#9A8478"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.6 }]}
            onPress={onSignInPress}
            disabled={isLoading}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
