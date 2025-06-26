import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, Image } from "react-native";
import { styles } from "@/assets/styles/auth.styles.js";
import { Picker } from "@react-native-picker/picker";

export default function Page() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to</Text>
      <Image
        source={require("@/assets/images/YarSuText.png")}
        style={styles.logotext}
      />

      <View style={styles.optionContainer}>
        <Text style={styles.optionLabel}>Do you have an account?</Text>
        <Link style={styles.optionButton} href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link style={styles.optionButton} href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
        <Picker mode="dropdown" style={styles.language}>
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Myanmar" value="mm" />
        </Picker>
      </View>
    </View>
  );
}
