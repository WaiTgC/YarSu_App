import React, { useState, useEffect } from "react";
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
import { useUser } from "@/context/UserContext";
import { useLinks } from "@/hooks/useLinks"; // Import useLinks
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "@/assets/styles/adminstyles/generalSettings.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";

// Define static default banner images
const defaultBanners = [
  require("@/assets/images/banner.png"),
  require("@/assets/images/banner1.png"),
  require("@/assets/images/banner2.png"),
  require("@/assets/images/banner3.png"),
];

const GeneralSettings = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { profile, updateProfile } = useUser();
  const { links, fetchLinks, createLink, updateLink, deleteLink, loadLinks } =
    useLinks(); // Use useLinks hook
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [bannerImages, setBannerImages] =
    useState<(string | { uri: string } | any)[]>(defaultBanners);
  const [linkInputs, setLinkInputs] = useState({
    tiktok: "",
    facebook: "",
    instagram: "",
    youtube: "",
  });

  // Load images from AsyncStorage and fetch links on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load banner images
        const savedImages = await AsyncStorage.getItem("bannerImages");
        if (savedImages) {
          const parsedImages = JSON.parse(savedImages);
          setBannerImages(
            parsedImages.map((img: string | null, index: number) =>
              img ? { uri: img } : defaultBanners[index]
            )
          );
          console.log(
            "GeneralSettings - Loaded images from AsyncStorage:",
            parsedImages
          );
        } else {
          console.log(
            "GeneralSettings - No saved images, using default banners"
          );
          setBannerImages(defaultBanners);
        }

        // Fetch links from backend
        await loadLinks();
      } catch (error) {
        console.error(
          "GeneralSettings - Error loading data from AsyncStorage or links:",
          error
        );
        setBannerImages(defaultBanners);
      }
    };
    loadData();
  }, [loadLinks]);

  // Update linkInputs when links change
  useEffect(() => {
    const updatedInputs = {
      tiktok: "",
      facebook: "",
      instagram: "",
      youtube: "",
    };
    links.forEach((link) => {
      const platform = link.platform.toLowerCase();
      if (platform in updatedInputs) {
        updatedInputs[platform] = link.url;
      }
    });
    setLinkInputs(updatedInputs);
  }, [links]);

  const handleEdit = () => setIsEditing(true);

  const handleEditField = (field: string) => setEditingField(field);

  const handleSaveField = async (field: string, value: string) => {
    try {
      const platform = field.charAt(0).toUpperCase() + field.slice(1);
      const existingLink = links.find(
        (link) => link.platform.toLowerCase() === field
      );

      if (existingLink) {
        // Update existing link
        await updateLink(existingLink.id, { platform, url: value });
      } else {
        // Create new link
        await createLink({ platform, url: value });
      }

      // Update profile for consistency (optional, depending on requirements)
      await updateProfile({ [field]: value });

      setEditingField(null);
      Alert.alert(
        "Saved",
        `${field.charAt(0).toUpperCase() + field.slice(1)} link saved!`
      );
    } catch (error) {
      console.error(`Error saving ${field} link:`, error);
      Alert.alert("Error", `Failed to save ${field} link.`);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    // Save images to AsyncStorage
    const imageUris = bannerImages.map((image) =>
      typeof image === "object" && image.uri ? image.uri : null
    );
    try {
      await AsyncStorage.setItem("bannerImages", JSON.stringify(imageUris));
      console.log(
        "GeneralSettings - Saved image URIs to AsyncStorage:",
        imageUris
      );

      // Update profile with image URIs
      const updates = {
        bannerImage1: imageUris[0],
        bannerImage2: imageUris[1],
        bannerImage3: imageUris[2],
        bannerImage4: imageUris[3],
      };

      await updateProfile(updates);
      console.log("GeneralSettings - Profile updated with images:", updates);
      Alert.alert("Saved", "Settings have been saved locally!");
    } catch (error) {
      console.error(
        "GeneralSettings - Error saving to AsyncStorage or profile:",
        error
      );
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const handleChange = (field: string, value: string) => {
    setLinkInputs((prev) => ({ ...prev, [field]: value }));
  };

  const pickBannerImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = [...bannerImages];
      newImages[index] = { uri: result.assets[0].uri };
      setBannerImages(newImages);
      console.log(
        `GeneralSettings - Picked image ${index}:`,
        result.assets[0].uri
      );
    }
  };

  const removeBannerImage = (index: number) => {
    const newImages = [...bannerImages];
    newImages[index] = defaultBanners[index];
    setBannerImages(newImages);
    console.log(
      `GeneralSettings - Removed banner ${index}, reverted to default`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Links</Text>
        {["tiktok", "facebook", "instagram", "youtube"].map((field) => (
          <View key={field} style={styles.fieldRow}>
            <Text style={styles.label}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Text>
            {editingField === field ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={linkInputs[field] || ""}
                  onChangeText={(text) => handleChange(field, text)}
                  placeholder={`Enter ${field} link`}
                />
                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: 10 }]}
                  onPress={() =>
                    handleSaveField(field, linkInputs[field] || "")
                  }
                >
                  <Text style={styles.actionText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <View style={styles.valueContainer}>
                  <Text style={styles.value}>
                    {linkInputs[field] || "Not set"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, { marginLeft: 10 }]}
                  onPress={() => handleEditField(field)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.header}>Highlight Photos / Videos</Text>
        <View style={styles.bannerContainer}>
          {bannerImages.map((image, index) => (
            <View key={index} style={styles.bannerPlaceholder}>
              <TouchableOpacity
                onPress={() => pickBannerImage(index)}
                style={styles.imageWrapper}
              >
                <Image
                  source={typeof image === "string" ? { uri: image } : image}
                  style={styles.bannerImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log(
                      `GeneralSettings - Image load error for banner ${index}:`,
                      error.nativeEvent,
                      `URL: ${JSON.stringify(image)}`
                    );
                    // Fallback to default banner on error
                    const newImages = [...bannerImages];
                    newImages[index] = defaultBanners[index];
                    setBannerImages(newImages);
                  }}
                />
              </TouchableOpacity>
              {isEditing && (
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
            onPress={handleEdit}
            disabled={isEditing}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default GeneralSettings;
