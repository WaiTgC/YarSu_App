import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";
import { COLORS } from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");

  const slideAnim = useRef(new Animated.Value(1000)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const slideUp = Animated.spring(slideAnim, {
      toValue: 0,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    });

    const shake = Animated.sequence([
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
    ]);

    Animated.parallel([slideUp, shake]).start();
  }, [slideAnim, shakeAnim]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

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
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.message ||
          "An error occurred during sign-up. Please check your inputs and try again."
      );
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    if (!code) {
      setError("Verification code is required");
      return;
    }

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification failed. Please check the code and try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.message || "An error occurred during verification"
      );
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
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
            <TouchableOpacity onPress={() => setError("")}>
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
        <TouchableOpacity onPress={onVerifyPress} style={styles.button}>
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
      <View style={styles.containerbg}>
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
            <TouchableOpacity onPress={() => setError("")}>
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
              placeholderTextColor="#9A8478"
              placeholder="✉ Enter email"
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              placeholderTextColor="#9A8478"
              placeholder="👤 Enter username"
              value={username}
              onChangeText={(username) => setUsername(username)}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              value={password}
              placeholderTextColor="#9A8478"
              placeholder="🔒 Enter password"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/sign-in">
              <Text style={styles.linkText}>Sign In</Text>
            </Link>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
