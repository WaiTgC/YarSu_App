import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
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
import { styles } from "@/assets/styles/adminstyles/generalSettings.styles";
import Ionicons from "@expo/vector-icons/Ionicons";

// Static array of fallback images
const fallbackImages = [
  require("@/assets/images/banner.png"),
  require("@/assets/images/banner1.png"),
  require("@/assets/images/banner2.png"),
  require("@/assets/images/banner3.png"),
];

const GeneralSettings = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { profile, updateProfile } = useUser();
  const [isEditingLinks, setIsEditingLinks] = useState({
    telegram: false,
    facebook: false,
    youtube: false,
    tiktok: false,
  });
  const [isEditingBanners, setIsEditingBanners] = useState(false);
  const [bannerImages, setBannerImages] = useState([
    profile.bannerImage1 || fallbackImages[0],
    profile.bannerImage2 || fallbackImages[1],
    profile.bannerImage3 || fallbackImages[2],
    profile.bannerImage4 || fallbackImages[3],
  ]);

  const handleEditLink = (field: string) => {
    setIsEditingLinks((prev) => ({ ...prev, [field]: true }));
  };

  const handleSaveLink = async (field: string) => {
    setIsEditingLinks((prev) => ({ ...prev, [field]: false }));
    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    Alert.alert("Saved", `${field} link has been saved locally!`);
  };

  const handleChange = (field: string, value: string) => {
    updateProfile({ [field]: value });
  };

  const handleEditBanners = () => setIsEditingBanners(true);
  const handleSaveBanners = async () => {
    setIsEditingBanners(false);
    await updateProfile({
      bannerImage1: bannerImages[0],
      bannerImage2: bannerImages[1],
      bannerImage3: bannerImages[2],
      bannerImage4: bannerImages[3],
    });
    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    Alert.alert("Saved", "Banner images have been saved locally!");
  };

  const pickBannerImage = async (index: number) => {
    if (!isEditingBanners) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = [...bannerImages];
      newImages[index] = { uri: result.assets[0].uri };
      setBannerImages(newImages);
    }
  };

  const removeBannerImage = (index: number) => {
    if (!isEditingBanners) return;
    const newImages = [...bannerImages];
    newImages[index] = fallbackImages[index];
    setBannerImages(newImages);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Links</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Telegram</Text>
          {isEditingLinks.telegram ? (
            <>
              <TextInput
                style={styles.input}
                value={profile.telegram || ""}
                onChangeText={(text) => handleChange("telegram", text)}
                placeholder="Enter Telegram link"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveLink("telegram")}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>
                  {profile.telegram || "Not set"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditLink("telegram")}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>Facebook</Text>
          {isEditingLinks.facebook ? (
            <>
              <TextInput
                style={styles.input}
                value={profile.facebook || ""}
                onChangeText={(text) => handleChange("facebook", text)}
                placeholder="Enter Facebook link"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveLink("facebook")}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>
                  {profile.facebook || "Not set"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditLink("facebook")}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>YouTube</Text>
          {isEditingLinks.youtube ? (
            <>
              <TextInput
                style={styles.input}
                value={profile.youtube || ""}
                onChangeText={(text) => handleChange("youtube", text)}
                placeholder="Enter YouTube link"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveLink("youtube")}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{profile.youtube || "Not set"}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditLink("youtube")}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>TikTok</Text>
          {isEditingLinks.tiktok ? (
            <>
              <TextInput
                style={styles.input}
                value={profile.tiktok || ""}
                onChangeText={(text) => handleChange("tiktok", text)}
                placeholder="Enter TikTok link"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveLink("tiktok")}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.valueContainer}>
                <Text style={styles.value}>{profile.tiktok || "Not set"}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditLink("tiktok")}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.header}>Highlight Photos / Videos</Text>
        <View style={styles.bannerContainer}>
          {bannerImages.map((image, index) => (
            <View key={index} style={styles.bannerPlaceholder}>
              <TouchableOpacity
                onPress={() => pickBannerImage(index)}
                style={styles.imageWrapper}
                disabled={!isEditingBanners}
              >
                <Image
                  source={image}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              {isEditingBanners && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeBannerImage(index)}
                >
                  <Ionicons name="close" size={20} color={COLORS.red} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditBanners}
            disabled={isEditingBanners}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          {isEditingBanners && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSaveBanners}
            >
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default GeneralSettings;
