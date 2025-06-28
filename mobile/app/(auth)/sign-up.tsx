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
import { Picker } from "@react-native-picker/picker";
import { countryCodes } from "@/libs/countryCodes";

interface CountryCode {
  label: string;
  value: string;
}

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+63"); // Default to Philippines
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

  useEffect(() => {
    console.log("Selected country code:", selectedCountryCode); // Debug log
  }, [selectedCountryCode]);

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhone(cleaned);
  };

  const handleCountryCodeChange = (value: string) => {
    console.log("Picker value changed:", value); // Debug log
    setSelectedCountryCode(value);
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    const phoneNumber = `${selectedCountryCode}${phone}`;

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
    if (!phone) {
      setError("Phone number is required");
      return;
    }
    if (selectedCountryCode === "+63" && !phoneNumber.match(/^\+63\d{10}$/)) {
      setError(
        "Philippine phone number must be 10 digits (e.g., +639123456789)"
      );
      return;
    }
    if (!phoneNumber.match(/^\+\d{10,15}$/)) {
      setError(
        "Please enter a valid phone number (e.g., +12025550123 or +639123456789)"
      );
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
        phoneNumber,
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
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            autoCapitalize="none"
            value={emailAddress}
            placeholderTextColor="#9A8478"
            placeholder="Enter email"
            onChangeText={(email) => setEmailAddress(email)}
          />
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            placeholderTextColor="#9A8478"
            placeholder="Enter username"
            value={username}
            onChangeText={(username) => setUsername(username)}
          />
          <View style={styles.phoneinputcontainer}>
            <View
              style={{
                width: 120,
                height: 50,
                padding: 0,
              }}
            >
              <Picker
                selectedValue={selectedCountryCode}
                onValueChange={handleCountryCodeChange}
                style={styles.picker}
                mode="dropdown"
                itemStyle={{
                  fontSize: 16,
                  height: 50,
                  color: "#000",
                }}
              >
                {countryCodes.map((countryCode: CountryCode) => (
                  <Picker.Item
                    key={countryCode.value}
                    label={countryCode.value}
                    value={countryCode.value}
                    style={{ fontSize: 16, color: "#000" }}
                  />
                ))}
              </Picker>
            </View>
            <TextInput
              style={[styles.phoneInput, error && styles.errorInput]}
              value={phone}
              placeholder="Enter phone number"
              placeholderTextColor="#9A8478"
              keyboardType="phone-pad"
              onChangeText={handlePhoneChange}
            />
          </View>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            value={password}
            placeholderTextColor="#9A8478"
            placeholder="Enter password"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
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
