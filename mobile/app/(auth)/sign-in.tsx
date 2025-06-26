import { useSignIn } from "@clerk/clerk-expo";
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
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  // Animation setup
  const slideAnim = useRef(new Animated.Value(1000)).current; // Start off-screen (bottom)
  const shakeAnim = useRef(new Animated.Value(0)).current; // For shake effect

  useEffect(() => {
    // Define the slide-up animation (smooth and fast)
    const slideUp = Animated.spring(slideAnim, {
      toValue: 0, // Move to final position
      friction: 7, // Lower friction for smoother bounce
      tension: 40, // Higher tension for faster movement
      useNativeDriver: true,
    });

    // Define the shake animation (subtle back-and-forth)
    const shake = Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10, // Move right
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10, // Move left
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5, // Move right slightly
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0, // Return to center
        duration: 50,
        useNativeDriver: true,
      }),
    ]);

    // Run both animations in parallel
    Animated.parallel([slideUp, shake]).start();
  }, [slideAnim, shakeAnim]);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={[styles.containerbg]}>
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ translateX: shakeAnim }], // Apply shake animation
            },
          ]}
        >
          Log In
        </Animated.Text>
        {error ? (
          <Animated.View
            style={[
              styles.errorBox,
              {
                transform: [{ translateX: shakeAnim }], // Apply shake animation
              },
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
            {
              transform: [{ translateY: slideAnim }], // Apply slide animation
            },
          ]}
        >
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9A8478"
            onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          />
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
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
