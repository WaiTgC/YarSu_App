import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useDetail } from "@/hooks/useDetail";
import { styles } from "@/assets/styles/adminstyles/detail.styles";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { supabase } from "@/libs/supabase";

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

const AdminDetail = () => {
  const { docPosts, loadDocPosts, addDocPost, updateDocPost, deleteDocPost } =
    useDetail();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<DocType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedDocType;
  }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(
    null
  );
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPost, setNewPost] = useState<{
    text: string;
    media: { uri: string; type: string; name: string }[];
  }>({
    text: "",
    media: [],
  });
  const [currentIndices, setCurrentIndices] = useState<{
    [key: number]: number;
  }>({});
  const [numColumns, setNumColumns] = useState(1);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  // Request permissions for document picker
  useEffect(() => {
    (async () => {
      const { status } = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
        multiple: true,
      });
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant permission to access the media library to add files."
        );
      }
    })();
  }, []);

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 1 : 1); // Keep single column for simplicity
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMount.current) {
      loadDocPosts();
      isInitialMount.current = false;
    }
  }, [loadDocPosts]);

  // Update posts when docPosts changes
  useEffect(() => {
    setPosts(docPosts);
    const initialIndices = docPosts.reduce((acc, post) => {
      acc[post.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
  }, [docPosts]);

  // Auto-slide media every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
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

  const handlePickMedia = async (id?: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "video/*"],
        multiple: true,
      });
      if (result.type === "success") {
        const files = [result].map((file) => ({
          uri: file.uri,
          type: file.mimeType || "application/octet-stream",
          name: file.name,
        }));
        if (id) {
          setEditedValues((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              media: [...(prev[id]?.media || []), ...files],
            },
          }));
        } else {
          setNewPost((prev) => ({
            ...prev,
            media: [...prev.media, ...files],
          }));
        }
      } else if (result.type === "cancel") {
        console.log("User cancelled media picker");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick media files");
    }
  };

  const handleSave = async (id: number) => {
    const updatedDoc = editedValues[id] || {};
    const convertedDoc: Partial<DocType> = {};
    const files = updatedDoc.media || [];

    if (updatedDoc.text) convertedDoc.text = updatedDoc.text;
    if (files.length > 0) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = file.type.includes("video") ? "mp4" : "jpg";
        const fileName = `doc-${id}-${Date.now()}-${i}.${extension}`;
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const { error } = await supabase.storage
          .from("doc-media")
          .upload(fileName, blob, { contentType: file.type });
        if (error) {
          console.error("Media upload error:", error);
          Alert.alert("Error", "Failed to upload media.");
          return;
        }
        const { data } = supabase.storage
          .from("doc-media")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }
      convertedDoc.media = uploadedUrls;
    }

    try {
      if (Object.keys(convertedDoc).length > 0) {
        await updateDocPost(id, convertedDoc);
        setEditMode({ ...editMode, [id]: false });
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        Alert.alert(
          "Saved",
          labels[language].saved || "Changes have been saved!"
        );
      } else {
        setEditMode({ ...editMode, [id]: false });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update document");
    }
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

  const handleCreatePost = async () => {
    try {
      if (!newPost.text && newPost.media.length === 0) {
        Alert.alert(
          "Error",
          labels[language].noContent ||
            "At least one of text or media must be provided"
        );
        return;
      }
      const convertedDoc: Partial<DocType> = { text: newPost.text };
      if (newPost.media.length > 0) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < newPost.media.length; i++) {
          const file = newPost.media[i];
          const extension = file.type.includes("video") ? "mp4" : "jpg";
          const fileName = `doc-new-${Date.now()}-${i}.${extension}`;
          const response = await fetch(file.uri);
          const blob = await response.blob();
          const { error } = await supabase.storage
            .from("doc-media")
            .upload(fileName, blob, { contentType: file.type });
          if (error) {
            console.error("Media upload error:", error);
            Alert.alert("Error", "Failed to upload media.");
            return;
          }
          const { data } = supabase.storage
            .from("doc-media")
            .getPublicUrl(fileName);
          uploadedUrls.push(data.publicUrl);
        }
        convertedDoc.media = uploadedUrls;
      }
      await addDocPost(convertedDoc);
      setCreateModalVisible(false);
      setNewPost({ text: "", media: [] });
      loadDocPosts();
      Alert.alert(
        "Created",
        labels[language].created || "Document has been created!"
      );
    } catch (error) {
      Alert.alert("Error", "Failed to create document");
    }
  };

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = posts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex - 1 + totalMedia) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalMedia = posts.find((p) => p.id === id)?.media?.length || 1;
      const newIndex = (currentIndex + 1) % totalMedia;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderItem = ({ item }: { item: DocType }) => {
    if (!item) return null;
    const media = item.media || [];
    const isEditing = editMode[item.id] || false;
    const currentValues = editedValues[item.id] || {};

    return (
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>{labels[language].text || "Text"}:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.text || item.text || ""}
                onChangeText={(text) => handleEdit(item.id, "text", text)}
                placeholder={labels[language].enterText || "Enter text"}
              />
            ) : (
              <Text style={styles.value}>{item.text || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>
              {labels[language].postedBy || "Posted by"}:
            </Text>
            <Text style={styles.value}>{item.users?.email || "Unknown"}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.imageContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.mediaPickerButton}
                  onPress={() => handlePickMedia(item.id)}
                >
                  <Text style={styles.mediaPickerButtonText}>
                    {labels[language].addMedia || "Add Media"}
                  </Text>
                </TouchableOpacity>
                {currentValues.media?.length > 0 && (
                  <View style={styles.previewContainer}>
                    {currentValues.media.map((file, index) => (
                      <View key={index}>
                        {file.type.includes("image") ? (
                          <Image
                            source={{ uri: file.uri }}
                            style={styles.previewImage}
                          />
                        ) : (
                          <View style={styles.previewVideo}>
                            <Text style={styles.previewVideoText}>
                              Video Preview
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.imageBackground}>
                  <Carousel
                    ref={(ref) => {
                      if (ref) carouselRefs.current[item.id] = ref;
                    }}
                    width={styles.imageBackground.width}
                    height={150}
                    data={
                      media.length > 0
                        ? media
                        : ["https://picsum.photos/340/200"]
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
                            console.error(
                              "Image load error:",
                              error.nativeEvent
                            )
                          }
                        />
                      )
                    }
                  />
                </View>
                {media.length === 1 && <View style={styles.noImages}></View>}
                {(media.length > 1 ||
                  (media.length === 0 &&
                    ["https://picsum.photos/340/200"].length > 1)) && (
                  <View style={styles.sliderControls}>
                    <TouchableOpacity onPress={() => handlePrev(item.id)}>
                      <Text style={styles.arrow}>{"<"}</Text>
                    </TouchableOpacity>
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
                    <TouchableOpacity onPress={() => handleNext(item.id)}>
                      <Text style={styles.arrow}>{">"}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSave(item.id)}
              >
                <Text style={styles.buttonText}>
                  {labels[language].save || "Save"}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setEditMode({ ...editMode, [item.id]: true })}
              >
                <Text style={styles.buttonText}>
                  {labels[language].edit || "Edit"}
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {labels[language].createDocument || "Create New Document"}
        </Text>
      </TouchableOpacity>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noDocuments || "No documents available"}
            </Text>
          }
        />
      </View>
      <Modal
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {labels[language].createDocument || "Create New Document"}
            </Text>
            <TextInput
              style={styles.input}
              value={newPost.text}
              onChangeText={(text) => setNewPost((prev) => ({ ...prev, text }))}
              placeholder={labels[language].enterText || "Enter text"}
            />
            <TouchableOpacity
              style={styles.mediaPickerButton}
              onPress={() => handlePickMedia()}
            >
              <Text style={styles.mediaPickerButtonText}>
                {labels[language].addMedia || "Add Media"}
              </Text>
            </TouchableOpacity>
            {newPost.media.length > 0 && (
              <View style={styles.previewContainer}>
                {newPost.media.map((file, index) => (
                  <View key={index}>
                    {file.type.includes("image") ? (
                      <Image
                        source={{ uri: file.uri }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <View style={styles.previewVideo}>
                        <Text style={styles.previewVideoText}>
                          Video: {file.name}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].cancel || "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonText}>
                  {labels[language].create || "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminDetail;
