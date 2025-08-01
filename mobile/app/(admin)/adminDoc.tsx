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
import * as FileSystem from "expo-file-system";
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
  images: string[];
  videos: string[];
  created_at: string;
};

type EditedDocType = {
  text?: string;
  media?: { uri: string; type: string; name: string; base64?: string }[];
  existingMedia?: string[];
};

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

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          labels[language].permissionDenied ||
            "Please grant permission to access the media library to add files."
        );
      }
    })();
  }, [language]);

  // Adjust number of columns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 3 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Load posts on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      loadDocPosts();
      isInitialMount.current = false;
    }
  }, [loadDocPosts]);

  // Sync posts and initialize states
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

  // Auto-scroll carousel for non-editing posts
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

  // Handle text input changes
  const handleEditText = (id: number, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: { ...prev[id], text: value },
    }));
  };

  // Handle media selection
  const handlePickMedia = async (id: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
        multiple: true,
      });
      if (result.assets) {
        const files = await Promise.all(
          result.assets.map(async (asset) => {
            let base64;
            if (Platform.OS !== "web") {
              base64 = await FileSystem.readAsStringAsync(asset.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              base64 = `data:${
                asset.mimeType || "application/octet-stream"
              };base64,${base64}`;
            }
            return {
              uri: asset.uri,
              type: asset.mimeType || "application/octet-stream",
              name:
                asset.name ||
                `file_${Date.now()}.${asset.uri.split(".").pop() || "jpg"}`,
              base64,
            };
          })
        );
        setEditedValues((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            media: [...(prev[id]?.media || []), ...files],
            existingMedia:
              prev[id]?.existingMedia ||
              posts.find((p) => p.id === id)?.media ||
              [],
          },
        }));
      }
    } catch (err) {
      Alert.alert(
        "Error",
        labels[language].mediaError || "Failed to pick media files."
      );
    }
  };

  // Handle media removal
  const handleRemoveMedia = (id: number, index: number) => {
    setEditedValues((prev) => {
      const currentMedia = prev[id]?.media || [];
      const currentExistingMedia =
        prev[id]?.existingMedia || posts.find((p) => p.id === id)?.media || [];
      if (index < currentExistingMedia.length) {
        // Removing an existing media URL
        const newExistingMedia = currentExistingMedia.filter(
          (_, i) => i !== index
        );
        return {
          ...prev,
          [id]: { ...prev[id], existingMedia: newExistingMedia },
        };
      } else {
        // Removing a newly added file
        const newMedia = currentMedia.filter(
          (_, i) => i !== index - currentExistingMedia.length
        );
        return {
          ...prev,
          [id]: { ...prev[id], media: newMedia },
        };
      }
    });
  };

  // Save changes
  const handleSave = async (id: number) => {
    const updatedDoc = editedValues[id] || {};
    const originalPost = posts.find((p) => p.id === id);
    if (!originalPost) return;

    // Check if any changes were made
    const hasTextChanged =
      updatedDoc.text !== undefined && updatedDoc.text !== originalPost.text;
    const hasMediaChanged =
      (updatedDoc.existingMedia &&
        updatedDoc.existingMedia.length !== originalPost.media.length) ||
      (updatedDoc.media && updatedDoc.media.length > 0);

    if (!hasTextChanged && !hasMediaChanged) {
      Alert.alert(
        "No Changes",
        labels[language].noChanges || "No changes were made to the document."
      );
      setEditMode((prev) => ({ ...prev, [id]: false }));
      return;
    }

    // Prepare postData for useDoc hook
    const postData: { text?: string; images?: string[]; videos?: string[] } =
      {};

    if (updatedDoc.text !== undefined) {
      postData.text = updatedDoc.text;
    }

    // Combine existing and new media as base64 strings or URLs
    const existingMedia = updatedDoc.existingMedia || originalPost.media || [];
    const newMedia = updatedDoc.media || [];
    const allImages = [
      ...existingMedia,
      ...newMedia
        .filter((file) => file.type.includes("image") && file.base64)
        .map((file) => file.base64!),
    ];

    if (allImages.length > 0) {
      postData.images = allImages;
    }
    postData.videos = []; // Align with useDoc hook's mapping

    try {
      await updateDocPost(id, postData);
      setEditMode((prev) => ({ ...prev, [id]: false }));
      setExpandedNotes((prev) => ({ ...prev, [id]: false }));
      setEditedValues((prev) => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
      Alert.alert(
        "Saved",
        labels[language].saved || "Changes have been saved!"
      );
    } catch (error) {
      Alert.alert(
        "Error",
        labels[language].updateError || "Failed to update post."
      );
    }
  };

  // Confirm and delete post
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
      Alert.alert(
        "Error",
        labels[language].deleteError || "Failed to delete document."
      );
    }
  };

  // Navigate to previous media item
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

  // Navigate to next media item
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
    const displayMedia = currentValues.existingMedia || media;
    const newMedia = currentValues.media || [];

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
                    setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
                  }
                  renderItem={({ item: url }) =>
                    url.includes(".mp4") ? (
                      <View style={styles.previewVideo}>
                        <Text style={styles.previewVideoText}>
                          Video: {url.split("/").pop()}
                        </Text>
                      </View>
                    ) : (
                      <Image source={{ uri: url }} style={styles.innerImage} />
                    )
                  }
                />
              </View>
              <TouchableOpacity onPress={() => handleNext(item.id)}>
                <Text style={styles.arrow}>{">"}</Text>
              </TouchableOpacity>
              {media.length > 1 && (
                <View style={styles.sliderControls}>
                  <FlatList
                    horizontal
                    contentContainerStyle={styles.indicatorContainer}
                    data={media}
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
          ) : (
            <ScrollView
              horizontal
              style={{ flexDirection: "row", maxHeight: 100 }}
            >
              {displayMedia.map((uri, index) => (
                <View
                  key={`existing-${index}`}
                  style={styles.mediaPreviewWrapper}
                >
                  <Image
                    source={{ uri }}
                    style={[styles.imagePreview, { marginLeft: 10 }]}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => handleRemoveMedia(item.id, index)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {newMedia.map((file, index) => (
                <View key={`new-${index}`} style={styles.mediaPreviewWrapper}>
                  <Image
                    source={{ uri: file.uri }}
                    style={[styles.imagePreview, { marginLeft: 10 }]}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() =>
                      handleRemoveMedia(item.id, displayMedia.length + index)
                    }
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={[
                  styles.imageInput,
                  {
                    marginLeft:
                      displayMedia.length + newMedia.length > 0 ? 10 : 0,
                  },
                ]}
                onPress={() => handlePickMedia(item.id)}
              >
                <Ionicons name="add" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.noteDropdownContainer}>
            <TouchableOpacity
              style={styles.noteTextBox}
              onPress={() => {
                if (!isEditing) {
                  setExpandedNotes((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id],
                  }));
                }
              }}
            >
              <View
                style={[
                  styles.noteTextContainer,
                  !isExpanded && !isEditing && styles.collapsedNoteText,
                ]}
              >
                {isEditing ? (
                  <TextInput
                    style={styles.value}
                    value={
                      currentValues.text !== undefined
                        ? currentValues.text
                        : item.text || ""
                    }
                    onChangeText={(text) => handleEditText(item.id, text)}
                    placeholder={labels[language].enterText || "Enter text"}
                    multiline
                  />
                ) : (
                  <Text style={styles.value}>
                    {currentValues.text !== undefined
                      ? currentValues.text
                      : item.text || "No text"}
                  </Text>
                )}
              </View>
              {!isEditing && (
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.black}
                  style={styles.dropdownArrow}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setEditMode((prev) => ({ ...prev, [item.id]: true }));
                setExpandedNotes((prev) => ({ ...prev, [item.id]: true }));
              }}
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
          transparent
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
