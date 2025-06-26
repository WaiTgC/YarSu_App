import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Link, router } from "expo-router";
import { styles } from "@/assets/styles/auth.styles";

export default function index() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/YarSu.png")}
        style={styles.illustration}
      />
      <TouchableOpacity onPress={() => router.push("./(auth)")}>
        <Text style={styles.taphere}>Tap Here</Text>
      </TouchableOpacity>
    </View>
  );
}
