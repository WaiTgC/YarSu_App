// app/(auth)/sign-up.tsx
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { supabase } from "@/libs/supabase";
import { getUserRole } from "@/services/authService";

export default function SignUpScreen() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const onSignUpPress = async () => {
    if (!emailAddress) {
      setError("Email address is required");
      return;
    }
    if (!emailAddress.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!username) {
      setError("Username is required");
      return;
    }
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      console.log("Attempting sign-up:", emailAddress);
      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password,
        options: { data: { username } },
      });
      if (error) throw new Error(error.message);
      if (data.session) {
        console.log("Sign-up successful, pending verification");
        setPendingVerification(true);
      } else {
        setError("Sign-up failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(err.message || "An error occurred during sign-up.");
    }
  };

  const onVerifyPress = async () => {
    if (!code) {
      setError("Verification code is required");
      return;
    }

    try {
      console.log("Verifying OTP for:", emailAddress);
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailAddress,
        token: code,
        type: "signup",
      });
      if (error) throw new Error(error.message);
      if (data.session) {
        const user = await getUserRole();
        console.log(
          "Verification successful, redirecting to:",
          user.role === "admin" ? "/(admin)/dashboard" : "/(root)/home"
        );
        router.replace(
          user.role === "admin" ? "/(admin)/dashboard" : "/(root)/home"
        );
      } else {
        setError("Verification failed. Please check the code.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "An error occurred during verification.");
    }
  };

  if (pendingVerification) {
    return (
      <View
        style={styles.verificationContainer}
        onStartShouldSetResponder={() => true}
      >
        <Animated.Text
          style={[
            styles.verificationTitle,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          Verify your email
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
        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity
          onPress={onVerifyPress}
          style={styles.button}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={60}
    >
      <View style={styles.containerbg} onStartShouldSetResponder={() => true}>
        <Animated.Text
          style={[styles.title, { transform: [{ translateX: shakeAnim }] }]}
        >
          Create Account
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
              value={emailAddress}
              placeholder="✉ Enter email"
              placeholderTextColor="#9A8478"
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              placeholder="👤 Enter username"
              value={username}
              placeholderTextColor="#9A8478"
              onChangeText={(username) => setUsername(username)}
              autoCapitalize="none"
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
            style={styles.button}
            onPress={onSignUpPress}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
