import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { COLORS } from "@/constants/colors";
import { useUser } from "@/context/UserContext";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "@/assets/styles/adminstyles/settings.styles";

const Settings = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { profile, updateProfile, uploadImage } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    setIsEditing(false);
    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    Alert.alert("Saved", "Profile has been saved locally!");
  };

  const handleChange = (field: string, value: string) => {
    updateProfile({ [field]: value });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const file = {
        uri: result.assets[0].uri,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      const imageUrl = result.assets[0].uri;
      await updateProfile({ imageUrl });
      await AsyncStorage.setItem("userProfileImage", imageUrl);
      Alert.alert("Success", "Image updated locally!");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Edit Profile</Text>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={pickImage}
        >
          <Image
            source={
              profile.imageUrl
                ? { uri: profile.imageUrl }
                : require("@/assets/images/camera.png")
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter name"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.phoneNumber || ""}
              onChangeText={(text) => handleChange("phoneNumber", text)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.phoneNumber || ""}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.address || ""}
              onChangeText={(text) => handleChange("address", text)}
              placeholder="Enter address"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.address || ""}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{profile.email || ""}</Text>
          </View>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Telegram</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.telegram || ""}
              onChangeText={(text) => handleChange("telegram", text)}
              placeholder="Enter Telegram link"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.telegram || ""}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Facebook</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.facebook || ""}
              onChangeText={(text) => handleChange("facebook", text)}
              placeholder="Enter Facebook link"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.facebook || ""}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>TikTok</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.tiktok || ""}
              onChangeText={(text) => handleChange("tiktok", text)}
              placeholder="Enter TikTok link"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.tiktok || ""}</Text>
            </View>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>YouTube</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={profile.youtube || ""}
              onChangeText={(text) => handleChange("youtube", text)}
              placeholder="Enter YouTube link"
            />
          ) : (
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{profile.youtube || ""}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={isEditing ? handleSave : handleEdit}
        >
          <Text style={styles.actionText}>{isEditing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Settings;
