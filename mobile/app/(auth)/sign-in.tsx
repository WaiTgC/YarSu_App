import { useSignIn, useUser } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { styles } from "@/assets/styles/auth.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user } = useUser();
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

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

    if (user) {
      const role = user.publicMetadata?.role;
      if (role === "admin") {
        router.replace("/(admin)");
      } else {
        router.replace("/(root)");
      }
    }
  }, [slideAnim, shakeAnim, user, router]);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        const role = (await useUser().user)?.publicMetadata?.role;
        if (role === "admin") {
          router.replace("/(admin)");
        } else {
          router.replace("/(root)");
        }
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError("Sign-in failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.containerbg}>
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
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={[styles.input, error && styles.errorInput]}
              autoCapitalize="none"
              value={identifier}
              placeholder="👤 Enter email or username"
              placeholderTextColor="#9A8478"
              onChangeText={(identifier) => setIdentifier(identifier)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, error && styles.errorInput]}
                value={password}
                placeholder="🔒 Enter password"
                placeholderTextColor="#9A8478"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
              />
            </View>
          </View>
          <Link href="/reset-password" asChild>
            <TouchableOpacity style={styles.forgotPasswordLink}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>
  );
}
