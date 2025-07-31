import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Video,
} from "react-native";
import DocumentPicker from "react-native-document-picker";
import { useDoc } from "@/hooks/useDoc";
import { styles } from "@/assets/styles/doc.styles";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

type DocType = {
  id: number;
  text: string;
  media: string[];
  created_at: string;
  users: { email: string };
};

type EditedDocType = Partial<{
  text: string;
}>;

const AdminDocs = () => {
  const { docPosts, loadDocPosts, addDocPost, updateDocPost, deleteDocPost } = useDoc();
  const [posts, setPosts] = useState<DocType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{ [key: number]: EditedDocType }>({});
  const [deleteModalVisible, setDeleteModalVisible] = useState<number | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPost, setNewPost] = useState<{ text: string; files: any[] }>({ text: "", files: [] });
  const [currentIndices, setCurrentIndices] = useState<{ [key: number]: number }>({});
  const [numColumns, setNumColumns] = useState(1);
  const isInitialMount = useRef(true);
  const carouselRefs = useRef<{ [key: number]: ICarouselInstance | null }>({});

  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 1 : 1);
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
  }, [docPosts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
            const totalMedia = post.media?.length || 1;
            const newIndex = (prev[post.id] + 1) % totalMedia;
            newIndices[post.id] = newIndex;
            carouselRefs.current[post.id]?.scrollTo({ index: newIndex, animated: true });
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

  const handleSave = async (id: number) => {
    const updatedDoc = editedValues[id] || {};
    const convertedDoc: Partial<DocType> = {};
    const files = editedValues[id]?.files || [];

    if (updatedDoc.text) convertedDoc.text = updatedDoc.text;

    try {
      if (Object.keys(convertedDoc).length > 0 || files.length > 0) {
        await updateDocPost(id, convertedDoc, files);
        setEditMode({ ...editMode, [id]: false });
        setEditedValues((prev) => {
          const newValues = { ...prev };
          delete newValues[id];
          return newValues;
        });
        Alert.alert("Saved", "Changes have been saved!");
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
      Alert.alert("Deleted", "Document has been deleted!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete document");
    }
  };

  const handlePickFiles = async (id?: number) => {
    try {
      const results = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
      });
      const files = results.map((file) => ({
        uri: file.uri,
        type: file.type,
        name: file.name,
      }));
      if (id) {
        setEditedValues((prev) => ({
          ...prev,
          [id]: { ...prev[id], files },
        }));
      } else {
        setNewPost((prev) => ({ ...prev, files }));
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled file picker");
      } else {
        Alert.alert("Error", "Failed to pick files");
      }
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.text && newPost.files.length === 0) {
        Alert.alert("Error", "At least one of text or media must be provided");
        return;
      }
      await addDocPost({ text: newPost.text }, newPost.files);
      setCreateModalVisible(false);
      setNewPost({ text: "", files: [] });
      loadDocPosts();
      Alert.alert("Created", "Document has been created!");
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
            <Text style={styles.label}>Text:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={currentValues.text || item.text || ""}
                onChangeText={(text) => handleEdit(item.id, "text", text)}
                placeholder="Enter text"
              />
            ) : (
              <Text style={styles.value}>{item.text || "N/A"}</Text>
            )}
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Posted by:</Text>
            <Text style={styles.value}>{item.users?.email || "Unknown"}</Text>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.imageContainer}>
            {isEditing ? (
              <TouchableOpacity style={styles.button} onPress={() => handlePickFiles(item.id)}>
                <Text style={styles.buttonText}>Pick Media Files</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.imageBackground}>
                  <Carousel
                    ref={(ref) => {
                      if (ref) carouselRefs.current[item.id] = ref;
                    }}
                    width={200}
                    height={150}
                    data={media.length > 0 ? media : ["https://picsum.photos/340/200"]}
                    scrollAnimationDuration={300}
                    defaultIndex={currentIndices[item.id] || 0}
                    onSnapToItem={(index) =>
                      setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
                    }
                    renderItem={({ item: url }) => (
                      url.includes('.mp4') ? (
                        <Video
                          source={{ uri: url }}
                          style={styles.innerImage}
                          resizeMode="contain"
                          paused={true}
                          onError={(error) => console.error("Video load error:", error)}
                        />
                      ) : (
                        <Image
                          source={{ uri: url }}
                          style={styles.innerImage}
                          onError={(error) => console.error("Image load error:", error.nativeEvent)}
                        />
                      )
                    )}
                  />
                </View>
                {media.length === 1 && <View style={styles.noImages}></View>}
                {(media.length > 1 || (media.length === 0 && ["https://picsum.photos/340/200"].length > 1)) && (
                  <View style={styles.sliderControls}>
                    <TouchableOpacity onPress={() => handlePrev(item.id)}>
                      <Text style={styles.arrow}>{"<"}</Text>
                    </TouchableOpacity>
                    <FlatList
                      horizontal
                      contentContainerStyle={styles.indicatorContainer}
                      data={media.length > 0 ? media : ["https://picsum.photos/340/200"]}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ index }) => (
                        <View
                          style={[
                            styles.indicator,
                            currentIndices[item.id] === index && styles.activeIndicator,
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
              <TouchableOpacity style={styles.button} onPress={() => handleSave(item.id)}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() => setEditMode({ ...editMode, [item.id]: true })}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteModalVisible(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
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
              <Text style={styles.modalText}>Are you sure you want to delete this document?</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(null)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => handleConfirmDelete(item.id)}
                >
                  <Text style={styles.modalButtonText}>Delete</Text>
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
      <TouchableOpacity style={styles.button} onPress={() => setCreateModalVisible(true)}>
        <Text style={styles.buttonText}>Create New Document</Text>
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
          ListEmptyComponent={<Text style={styles.title}>No documents available</Text>}
        />
      </View>
      <Modal
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Create New Document</Text>
            <TextInput
              style={styles.input}
              value={newPost.text}
              onChangeText={(text) => setNewPost((prev) => ({ ...prev, text }))}
              placeholder="Enter text"
            />
            <TouchableOpacity style={styles.button} onPress={() => handlePickFiles()}>
              <Text style={styles.buttonText}>Pick Media Files</Text>
            </TouchableOpacity>
            <Text style={styles.value}>Selected files: {newPost.files.length}</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminDocs;