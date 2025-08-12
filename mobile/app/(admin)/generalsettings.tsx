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
        await Promise.all([loadHighlights(), loadLinks()]);
      } catch (error) {
        console.error("GeneralSettings - Error loading data:", error);
        Alert.alert("Error", "Failed to load data.");
        setBannerImages(defaultBanners);
      }
    };
    loadData();
  }, [loadHighlights, loadLinks]);

  // Sync bannerImages with highlights
  useEffect(() => {
    if (highlights && highlights.length > 0) {
      const newBannerImages = defaultBanners.map((defaultBanner, index) => {
        const highlight = highlights[index];
        return highlight?.image ? { uri: highlight.image } : defaultBanner;
      });
      setBannerImages(newBannerImages);
    } else {
      setBannerImages(defaultBanners);
    }
  }, [highlights]);

  // Update linkInputs when links change
  useEffect(() => {
    setLinkInputs({
      telegram:
        links.find((l) => l.platform.toLowerCase() === "telegram")?.url || "",
      youtube:
        links.find((l) => l.platform.toLowerCase() === "youtube")?.url || "",
      facebook:
        links.find((l) => l.platform.toLowerCase() === "facebook")?.url || "",
      tiktok:
        links.find((l) => l.platform.toLowerCase() === "tiktok")?.url || "",
    });
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
        await updateLink(existingLink.id, { platform, url: value });
        setEditingField(null);
        Alert.alert("Success", `${platform} link saved!`);
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

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

      if (result.canceled || !result.assets) {
        return;
      }

      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `highlight-${Date.now()}-${index}.jpg`;

      // Remove existing image from Supabase if updating
      if (highlights[index]?.image) {
        const oldImagePath = highlights[index].image.split("/").pop();
        if (oldImagePath) {
          const { error: removeError } = await supabase.storage
            .from("general-images")
            .remove([oldImagePath]);
          if (removeError) {
            console.error("Error removing old image:", removeError);
            Alert.alert(
              "Error",
              `Failed to remove old image: ${removeError.message}`
            );
            return;
          }
        }
      }

      // Upload new image to Supabase
      const { error: uploadError } = await supabase.storage
        .from("general-images")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        Alert.alert("Error", `Failed to upload image: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage
        .from("general-images")
        .getPublicUrl(fileName);
      const imageUrl = data.publicUrl;

      // Update or create highlight
      const highlightData = { image: imageUrl };
      if (highlights[index]) {
        await updateHighlight(highlights[index].id, highlightData);
      } else {
        await createHighlight(highlightData);
      }

      // Update local state
      const newImages = [...bannerImages];
      newImages[index] = { uri: imageUrl };
      setBannerImages(newImages);

      // Refresh highlights
      await loadHighlights();
      Alert.alert("Success", "Image saved successfully!");
    } catch (error) {
      console.error("Error in pickBannerImage:", error);
      Alert.alert("Error", "Failed to save image.");
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
            console.error("Error removing image:", removeError);
            Alert.alert(
              "Error",
              `Failed to remove image: ${removeError.message}`
            );
            return;
          }
        }
        await deleteHighlight(highlights[index].id);
      }

      const newImages = [...bannerImages];
      newImages[index] = defaultBanners[index];
      setBannerImages(newImages);

      await loadHighlights();
      Alert.alert("Success", "Image removed successfully!");
    } catch (error) {
      console.error("Error in removeBannerImage:", error);
      Alert.alert("Error", "Failed to remove image.");
    }
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      await loadHighlights(); // Ensure latest data is fetched
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings.");
    }
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
                    console.error(
                      `Image load error for banner ${index}:`,
                      error.nativeEvent
                    );
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
