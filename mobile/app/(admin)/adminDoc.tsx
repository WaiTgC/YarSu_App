import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import { useDoc } from "@/hooks/useDoc";
import { styles } from "@/assets/styles/adminstyles/doc.styles";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { COLORS } from "@/constants/colors";

type DocType = {
  id: number;
  text: string;
  media: string[];
  created_at: string;
  users: { email: string };
};

type EditedDocType = Partial<{
  text: string;
  media: { uri: string; type: string; name: string }[];
}>;

const AdminDoc = () => {
  const { docPosts, loadDocPosts, updateDocPost, deleteDocPost } = useDoc();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<DocType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [expandedNotes, setExpandedNotes] = useState<{
    [key: number]: boolean;
  }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedDocType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [currentIndices, setCurrentIndices] = useState<{
    [key: number]: number;
  }>({});
  const [numColumns, setNumColumns] = useState(3);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access the media library to add files. Check app settings."
        );
      } else {
        console.log("Media permissions granted:", status);
      }
    })();
  }, []);

  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 3 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      loadDocPosts();
      isInitialMount.current = false;
    }
  }, [loadDocPosts]);

  useEffect(() => {
    setPosts(docPosts);
    const initialIndices = docPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
    const initialExpanded = docPosts.reduce((acc, post) => {
      acc[post.id] = false;
      return acc;
    }, {} as { [key: number]: boolean });
    setExpandedNotes(initialExpanded);
  }, [docPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (carouselRefs.current[post.id] && !editMode[post.id]) {
            const totalMedia = post.media?.length || 1;
            const newIndex = (prev[post.id] + 1) % totalMedia;
            newIndices[post.id] = newIndex;
            carouselRefs.current[post.id]?.scrollTo({
              index: newIndex,
              animated: true,
            });
          }
        });
        return newIndices;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [posts, editMode]);

  const handleEdit = (id: number, field: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handlePickMedia = async (id: number) => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status !== "granted") {
        const { status: requestStatus } =
          await MediaLibrary.requestPermissionsAsync();
        if (requestStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Media library access denied. Please enable permissions in settings."
          );
          return;
        }
      }
      console.log("Attempting to pick media for post ID:", id);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
        multiple: true,
      });
      console.log("DocumentPicker result:", result);

      if (result.assets) {
        const files = result.assets.map((asset) => {
          if (Platform.OS === "web") {
            return {
              uri: asset.uri,
              type: asset.mimeType || "application/octet-stream",
              name:
                asset.name ||
                `file_${Date.now()}.${asset.uri.split(".").pop() || "jpg"}`,
            };
          }
          return {
            uri: asset.uri,
            type: asset.mimeType || "application/octet-stream",
            name:
              asset.name ||
              `file_${Date.now()}.${asset.uri.split(".").pop() || "jpg"}`,
          };
        });
        console.log("Processed files:", files);
        setEditedValues((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            media: [...(prev[id]?.media || []), ...files],
          },
        }));
      } else if (result.type === "cancel") {
        console.log("User cancelled media picker");
      } else {
        console.warn("Unexpected result format:", result);
      }
    } catch (err) {
      console.error("Error picking media:", err);
      Alert.alert(
        "Error",
        "Failed to pick media files. Check console for Docs."
      );
    }
  };

  const handleRemoveMedia = (id: number, index: number) => {
    setEditedValues((prev) => {
      const currentMedia = prev[id]?.media || [];
      if (index < 0 || index >= currentMedia.length) {
        console.warn(
          "Invalid index for removal:",
          index,
          "Length:",
          currentMedia.length
        );
        return prev;
      }
      const newMedia = currentMedia.filter((_, i) => i !== index);
      return {
        ...prev,
        [id]: { ...prev[id], media: newMedia },
      };
    });
  };

  const handleSave = async (id: number) => {
    const updatedDoc = editedValues[id] || {};
    const convertedDoc: Partial<DocType> = {};
    const files = updatedDoc.media || [];

    if (updatedDoc.text) convertedDoc.text = updatedDoc.text;
    if (files.length > 0) {
      const formData = new FormData();
      if (updatedDoc.text) {
        formData.append("text", updatedDoc.text);
      }
      for (const [index, file] of files.entries()) {
        if (typeof file === "string") {
          formData.append(`media[${index}]`, file);
        } else {
          const blob = await fetch(file.uri).then((res) => res.blob());
          formData.append(`media[${index}]`, blob, file.name);
        }
      }
      try {
        await updateDocPost(id, convertedDoc, files);
      } catch (error) {
        console.error("Update error:", error);
        Alert.alert("Error", "Failed to update post. Check console for Docs.");
        return;
      }
    } else if (updatedDoc.text) {
      try {
        await updateDocPost(id, convertedDoc);
      } catch (error) {
        console.error("Update error:", error);
        Alert.alert("Error", "Failed to update post. Check console for Docs.");
        return;
      }
    } else {
      setEditMode((prev) => ({ ...prev, [id]: false }));
      return;
    }

    setEditMode((prev) => ({ ...prev, [id]: false }));
    setEditedValues((prev) => {
      const newValues = { ...prev };
      delete newValues[id];
      return newValues;
    });
    Alert.alert("Saved", labels[language].saved || "Changes have been saved!");
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteDocPost(id);
      setDeleteModalVisible(null);
      setPosts(posts.filter((post) => post.id !== id));
      Alert.alert(
        "Deleted",
        labels[language].deleted || "Document has been deleted!"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to delete document");
    }
  };

  const handlePrev = (id: number) => {
    const currentRef = carouselRefs.current[id];
    if (currentRef) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = posts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex - 1 + totalMedia) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      currentRef.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    const currentRef = carouselRefs.current[id];
    if (currentRef) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = posts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex + 1) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      currentRef.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: DocType }) => {
    if (!item) return null;
    const media = item.media || [];
    const isEditing = editMode[item.id] || false;
    const isExpanded = expandedNotes[item.id] || false;
    const currentValues = editedValues[item.id] || {};

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          {!isEditing ? (
            <>
              <TouchableOpacity onPress={() => handlePrev(item.id)}>
                <Text style={styles.arrow}>{"<"}</Text>
              </TouchableOpacity>
              <View style={styles.imageBackground}>
                <Carousel
                  ref={(ref) => {
                    if (ref) carouselRefs.current[item.id] = ref;
                  }}
                  width={styles.imageBackground.width}
                  height={200}
                  data={
                    media.length > 0 ? media : ["https://picsum.photos/340/200"]
                  }
                  scrollAnimationDuration={300}
                  defaultIndex={currentIndices[item.id] || 0}
                  onSnapToItem={(index) =>
                    setCurrentIndices((prev) => ({
                      ...prev,
                      [item.id]: index,
                    }))
                  }
                  renderItem={({ item: url }) =>
                    url.includes(".mp4") ? (
                      <View style={styles.previewVideo}>
                        <Text style={styles.previewVideoText}>
                          Video: {url.split("/").pop()}
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: url }}
                        style={styles.innerImage}
                        onError={(error) =>
                          console.error("Image load error:", error.nativeEvent)
                        }
                      />
                    )
                  }
                />
              </View>
              <TouchableOpacity onPress={() => handleNext(item.id)}>
                <Text style={styles.arrow}>{">"}</Text>
              </TouchableOpacity>
              {(media.length > 1 ||
                (media.length === 0 &&
                  ["https://picsum.photos/340/200"].length > 1)) && (
                <View style={styles.sliderControls}>
                  <FlatList
                    horizontal
                    contentContainerStyle={styles.indicatorContainer}
                    data={
                      media.length > 0
                        ? media
                        : ["https://picsum.photos/340/200"]
                    }
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ index }) => (
                      <View
                        style={[
                          styles.indicator,
                          currentIndices[item.id] === index &&
                            styles.activeIndicator,
                        ]}
                      />
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}
            </>
          ) : null}
          <ScrollView
            horizontal
            style={{ flexDirection: "row", maxHeight: 100 }}
          >
            {media.map((uri, index) => (
              <View key={index} style={styles.mediaPreviewWrapper}>
                <Image
                  source={{ uri }}
                  style={[styles.imagePreview, { marginLeft: 10 }]}
                  resizeMode="cover"
                />
                {isEditing && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => handleRemoveMedia(item.id, index)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {isEditing &&
              currentValues.media &&
              currentValues.media.map((file, index) => (
                <View key={`new-${index}`} style={styles.mediaPreviewWrapper}>
                  {typeof file === "string" ? (
                    <Image
                      source={{ uri: file }}
                      style={[styles.imagePreview, { marginLeft: 10 }]}
                      resizeMode="cover"
                    />
                  ) : file.type.includes("image") ? (
                    <Image
                      source={{ uri: file.uri }}
                      style={[styles.imagePreview, { marginLeft: 10 }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePreview}>
                      <Text style={styles.previewVideoText}>Video Preview</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() =>
                      handleRemoveMedia(item.id, media.length + index)
                    }
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.imageInput,
                  {
                    marginLeft:
                      media.length + (currentValues.media?.length || 0) > 0
                        ? 10
                        : 0,
                    padding: 10,
                  },
                ]}
                onPress={() => handlePickMedia(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color={COLORS.black} />
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        <View style={styles.detailsContainer}>
          {item.text || isEditing ? (
            <View style={styles.noteDropdownContainer}>
              <TouchableOpacity
                style={styles.noteTextBox}
                onPress={() =>
                  setExpandedNotes((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }))
                }
              >
                <View
                  style={[
                    styles.noteTextContainer,
                    !isExpanded && styles.collapsedNoteText,
                  ]}
                >
                  {isEditing && isExpanded ? (
                    <TextInput
                      style={styles.value}
                      value={currentValues.text || item.text || ""}
                      onChangeText={(text) => handleEdit(item.id, "text", text)}
                      placeholder={labels[language].enterText || "Enter text"}
                      multiline={true}
                    />
                  ) : (
                    <Text style={styles.value}>
                      {currentValues.text ||
                        item.text ||
                        "No additional notes available"}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.black}
                  style={styles.dropdownArrow}
                />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                setEditMode((prev) => ({ ...prev, [item.id]: true }))
              }
            >
              <Text style={styles.buttonText}>
                {labels[language].edit || "Edit"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSave(item.id)}
            >
              <Text style={styles.buttonText}>
                {labels[language].save || "Save"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setDeleteModalVisible(item.id)}
          >
            <Text style={styles.buttonText}>
              {labels[language].delete || "Delete"}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          transparent={true}
          visible={deleteModalVisible === item.id}
          onRequestClose={() => setDeleteModalVisible(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {labels[language].deleteConfirm ||
                  "Are you sure you want to delete this document?"}
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(null)}
                >
                  <Text style={styles.modalButtonText}>
                    {labels[language].cancel || "Cancel"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleConfirmDelete(item.id)}
                >
                  <Text style={styles.modalButtonText}>
                    {labels[language].delete || "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "space-around" } : undefined
          }
          ListEmptyComponent={
            <Text style={styles.value}>
              {labels[language].noPosts || "No document posts available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminDoc;
