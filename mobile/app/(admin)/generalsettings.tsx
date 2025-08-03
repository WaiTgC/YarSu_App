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
import { useLinks } from "@/hooks/useLinks";
import { useHighlights } from "@/hooks/useHighlights";
import * as ImagePicker from "expo-image-picker";
import { styles } from "@/assets/styles/adminstyles/generalSettings.styles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "@/constants/colors";
import { supabase } from "@/libs/supabase";

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
  const { links, fetchLinks, updateLink, loadLinks } = useLinks();
  const {
    highlights,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    loadHighlights,
  } = useHighlights();
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [bannerImages, setBannerImages] =
    useState<(string | { uri: string } | any)[]>(defaultBanners);
  const [linkInputs, setLinkInputs] = useState({
    telegram: "",
    youtube: "",
    facebook: "",
    tiktok: "",
  });

  // Load highlights and links from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadHighlights();
        await loadLinks();
      } catch (error) {
        console.error("GeneralSettings - Error loading data:", error);
        setBannerImages(defaultBanners);
      }
    };
    loadData();
  }, [loadHighlights, loadLinks]);

  // Update bannerImages when highlights change
  useEffect(() => {
    if (highlights && highlights.length > 0) {
      const newBannerImages = defaultBanners.map((defaultBanner, index) => {
        const highlight = highlights[index];
        return highlight && highlight.image
          ? { uri: highlight.image }
          : defaultBanner;
      });
      setBannerImages(newBannerImages);
      console.log(
        "GeneralSettings - Updated banner images from highlights:",
        newBannerImages
      );
    } else {
      setBannerImages(defaultBanners);
      console.log("GeneralSettings - No highlights, using default banners");
    }
  }, [highlights]);

  // Update linkInputs when links change
  useEffect(() => {
    const updatedInputs = {
      telegram: "",
      youtube: "",
      facebook: "",
      tiktok: "",
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
        setEditingField(null);
        Alert.alert(
          "Saved",
          `${field.charAt(0).toUpperCase() + field.slice(1)} link saved!`
        );
      } else {
        Alert.alert(
          "Error",
          `Cannot create new ${field} link. Only existing links can be edited.`
        );
      }
    } catch (error) {
      console.error(`Error saving ${field} link:`, error);
      Alert.alert("Error", `Failed to save ${field} link.`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setLinkInputs((prev) => ({ ...prev, [field]: value }));
  };

  const pickBannerImage = async (index: number) => {
    if (!isEditing) {
      Alert.alert("Error", "Please click Edit to select an image.");
      return;
    }

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
      const uri = result.assets[0].uri;

      // Convert image URI to Blob for Supabase upload
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `general-post-${Date.now()}-${index}.jpg`;

      // Remove existing image from Supabase if updating
      if (highlights[index] && highlights[index].image) {
        const oldImagePath = highlights[index].image.split("/").pop();
        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("general-images")
            .remove([oldImagePath]);
          if (removeError) {
            console.error(
              "GeneralSettings - Error removing old image:",
              removeError
            );
            Alert.alert(
              "Error",
              `Failed to remove old image: ${removeError.message}`
            );
            return;
          }
          console.log(`GeneralSettings - Removed old image: ${oldImagePath}`);
        }
      }

      // Upload new image to Supabase
      const { error: uploadError } = await supabase.storage
        .from("general-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true, // Overwrite if file exists
        });

      if (uploadError) {
        console.error(
          "GeneralSettings - Error uploading image to Supabase:",
          uploadError
        );
        Alert.alert("Error", `Failed to upload image: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage
        .from("general-images")
        .getPublicUrl(fileName);
      const imageUrl = data.publicUrl;

      // Update or create highlight in the backend
      try {
        const highlightData = { image: imageUrl };
        if (highlights[index]) {
          await updateHighlight(highlights[index].id, highlightData);
          console.log(
            `GeneralSettings - Updated highlight ${index}:`,
            imageUrl
          );
        } else {
          await createHighlight(highlightData);
          console.log(
            `GeneralSettings - Created highlight ${index}:`,
            imageUrl
          );
        }

        // Update local state
        const newImages = [...bannerImages];
        newImages[index] = { uri: imageUrl };
        setBannerImages(newImages);
        console.log(`GeneralSettings - Picked image ${index}:`, imageUrl);

        // Refresh highlights
        await loadHighlights();
      } catch (error) {
        console.error("GeneralSettings - Error saving highlight:", error);
        Alert.alert("Error", "Failed to save highlight image.");
      }
    }
  };

  const removeBannerImage = async (index: number) => {
    try {
      if (highlights[index]) {
        const oldImagePath = highlights[index].image.split("/").pop();
        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("general-images")
            .remove([oldImagePath]);
          if (removeError) {
            console.error(
              "GeneralSettings - Error removing image:",
              removeError
            );
            Alert.alert(
              "Error",
              `Failed to remove image: ${removeError.message}`
            );
            return;
          }
          console.log(`GeneralSettings - Removed image: ${oldImagePath}`);
        }
        await deleteHighlight(highlights[index].id);
        console.log(`GeneralSettings - Deleted highlight ${index}`);
      }
      const newImages = [...bannerImages];
      newImages[index] = defaultBanners[index];
      setBannerImages(newImages);
      console.log(
        `GeneralSettings - Removed banner ${index}, reverted to default`
      );

      // Refresh highlights
      await loadHighlights();
    } catch (error) {
      console.error("GeneralSettings - Error deleting highlight:", error);
      Alert.alert("Error", "Failed to remove highlight image.");
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Saved", "Settings have been saved!");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.card}>
        <Text style={styles.header}>Links</Text>
        {["telegram", "youtube", "facebook", "tiktok"].map((field) => (
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
