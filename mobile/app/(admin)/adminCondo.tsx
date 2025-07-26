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
} from "react-native";
import { useRouter } from "expo-router";
import { styles } from "@/assets/styles/adminstyles/condo.styles";
import { useCondos } from "@/hooks/useCondos";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

// Define the Condo type
type CondoType = {
  id: number;
  name: string;
  address: string;
  rent_fee: number;
  images: string[];
  swimming_pool: boolean;
  free_wifi: boolean;
  gym: boolean;
  garden: boolean;
  co_working_space: boolean;
};

// Define type for edited values
type EditedCondoType = Partial<{
  name: string;
  address: string;
  rent_fee: string | number;
  images: string;
  swimming_pool: string | boolean;
  free_wifi: string | boolean;
  gym: string | boolean;
  garden: string | boolean;
  co_working_space: string | boolean;
}>;

const AdminCondo = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { condos, loadCondos, editCondo, deleteCondo } = useCondos() as {
    condos: CondoType[];
    loadCondos: () => void;
    editCondo: (id: number, updatedCondo: Partial<CondoType>) => void;
    deleteCondo: (id: number) => void;
  };
  const [posts, setPosts] = useState<CondoType[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [editedValues, setEditedValues] = useState<{
    [key: number]: EditedCondoType;
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

  // Update numColumns based on screen width
  useEffect(() => {
    const updateColumns = () => {
      const width = Dimensions.get("window").width;
      setNumColumns(width >= 768 ? 3 : 1);
    };
    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);
    return () => subscription?.remove();
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMount.current) {
      console.log("AdminCondo: Initial fetch of condos");
      loadCondos();
      isInitialMount.current = false;
    }
  }, [loadCondos]);

  // Update posts when condos changes
  useEffect(() => {
    console.log("AdminCondo: Updating posts with condos", condos);
    setPosts(condos);
    const initialIndices = condos.reduce((acc, condo) => {
      acc[condo.id] = 0;
      return acc;
    }, {} as { [key: number]: number });
    setCurrentIndices(initialIndices);
  }, [condos]);

  // Auto-slide images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndices((prev) => {
        const newIndices = { ...prev };
        posts.forEach((post) => {
          if (!editMode[post.id] && carouselRefs.current[post.id]) {
            const totalImages = post.images.length || 1;
            const newIndex = (prev[post.id] + 1) % totalImages;
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

  const handleSave = (id: number) => {
    const updatedCondo = editedValues[id] || {};
    const convertedCondo: Partial<CondoType> = {};

    // Convert string inputs to appropriate types
    if (updatedCondo.name) {
      convertedCondo.name = updatedCondo.name;
    }
    if (updatedCondo.address) {
      convertedCondo.address = updatedCondo.address;
    }
    if (updatedCondo.rent_fee !== undefined) {
      const rentFee = Number(updatedCondo.rent_fee);
      if (!isNaN(rentFee)) {
        convertedCondo.rent_fee = rentFee;
      }
    }
    if (updatedCondo.images !== undefined) {
      convertedCondo.images = updatedCondo.images
        .split(",")
        .map((item) => item.trim());
    }
    if (updatedCondo.swimming_pool !== undefined) {
      convertedCondo.swimming_pool = updatedCondo.swimming_pool === "Yes";
    }
    if (updatedCondo.free_wifi !== undefined) {
      convertedCondo.free_wifi = updatedCondo.free_wifi === "Yes";
    }
    if (updatedCondo.gym !== undefined) {
      convertedCondo.gym = updatedCondo.gym === "Yes";
    }
    if (updatedCondo.garden !== undefined) {
      convertedCondo.garden = updatedCondo.garden === "Yes";
    }
    if (updatedCondo.co_working_space !== undefined) {
      convertedCondo.co_working_space = updatedCondo.co_working_space === "Yes";
    }

    if (Object.keys(convertedCondo).length > 0) {
      editCondo(id, convertedCondo);
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
  };

  const handleConfirmDelete = (id: number) => {
    deleteCondo(id);
    setDeleteModalVisible(null);
    setPosts(posts.filter((post) => post.id !== id));
    Alert.alert(
      "Deleted",
      labels[language].deleted || "Condo has been deleted!"
    );
  };

  const handlePrev = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images.length || 1;
      const newIndex = (currentIndex - 1 + totalImages) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const handleNext = (id: number) => {
    if (carouselRefs.current[id]) {
      const currentIndex = currentIndices[id] || 0;
      const totalImages = posts.find((p) => p.id === id)?.images.length || 1;
      const newIndex = (currentIndex + 1) % totalImages;
      setCurrentIndices((prev) => ({ ...prev, [id]: newIndex }));
      carouselRefs.current[id]?.scrollTo({ index: newIndex, animated: true });
    }
  };

  const renderRadioButton = (
    id: number,
    item: CondoType,
    field: string,
    value: string,
    label: string
  ) => (
    <TouchableOpacity
      key={`${field}-${value}`}
      style={styles.radioButton}
      onPress={() => handleEdit(id, field, value)}
    >
      <View style={styles.radioCircle}>
        {(editedValues[id]?.[field] === value ||
          (!editedValues[id]?.[field] &&
            ((field === "swimming_pool" &&
              value === (item.swimming_pool ? "Yes" : "No")) ||
              (field === "free_wifi" &&
                value === (item.free_wifi ? "Yes" : "No")) ||
              (field === "gym" && value === (item.gym ? "Yes" : "No")) ||
              (field === "garden" && value === (item.garden ? "Yes" : "No")) ||
              (field === "co_working_space" &&
                value === (item.co_working_space ? "Yes" : "No"))))) && (
          <Text style={styles.radioCheck}>✓</Text>
        )}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: CondoType }) => (
    <View style={styles.card}>
      <View style={styles.detailsContainer}>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.name || item.name || ""}
              onChangeText={(text) => handleEdit(item.id, "name", text)}
              placeholder="Enter name"
            />
          ) : (
            <Text style={styles.value}>{item.name || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].address || "Address"}:
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={editedValues[item.id]?.address || item.address || ""}
              onChangeText={(text) => handleEdit(item.id, "address", text)}
              placeholder="Enter address"
            />
          ) : (
            <Text style={styles.value}>{item.address || "N/A"}</Text>
          )}
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.label}>
            {labels[language].rentFee || "Rent Fee"}
          </Text>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.rent_fee !== undefined
                  ? String(editedValues[item.id].rent_fee)
                  : String(item.rent_fee || 0)
              }
              onChangeText={(text) => handleEdit(item.id, "rent_fee", text)}
              placeholder="Enter rent fee"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>
              {item.rent_fee ? `THB ${item.rent_fee} / month` : "N/A"}
            </Text>
          )}
        </View>
        <View style={styles.serviceRow}>
          <Text style={styles.label}>
            {labels[language].services || "Services"}
          </Text>
          <View style={[styles.serviceContainer, { flexDirection: "column" }]}>
            {!editMode[item.id] && (
              <>
                {item.swimming_pool && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.serviceLabel}>
                      {labels[language].swimmingPool || "Swimming Pool"}
                    </Text>
                  </View>
                )}
                {item.free_wifi && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.serviceLabel}>
                      {labels[language].freeWifi || "Free Wi-Fi"}
                    </Text>
                  </View>
                )}
                {item.gym && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.serviceLabel}>
                      {labels[language].gym || "Gym"}
                    </Text>
                  </View>
                )}
                {item.garden && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.serviceLabel}>
                      {labels[language].garden || "Garden"}
                    </Text>
                  </View>
                )}
                {item.co_working_space && (
                  <View style={styles.serviceItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.serviceLabel}>
                      {labels[language].coWorkingSpace || "Co-working Space"}
                    </Text>
                  </View>
                )}
              </>
            )}
            {editMode[item.id] && (
              <View style={{ flexDirection: "column", width: "100%" }}>
                <Text style={styles.value}>
                  {labels[language].swimmingPool || "Swimming Pool"}:
                </Text>
                <View style={styles.radioGroup}>
                  {["Yes", "No"].map((value) =>
                    renderRadioButton(
                      item.id,
                      item,
                      "swimming_pool",
                      value,
                      value
                    )
                  )}
                </View>
                <Text style={styles.value}>
                  {labels[language].freeWifi || "Free Wi-Fi"}:
                </Text>
                <View style={styles.radioGroup}>
                  {["Yes", "No"].map((value) =>
                    renderRadioButton(item.id, item, "free_wifi", value, value)
                  )}
                </View>
                <Text style={styles.value}>
                  {labels[language].gym || "Gym"}:
                </Text>
                <View style={styles.radioGroup}>
                  {["Yes", "No"].map((value) =>
                    renderRadioButton(item.id, item, "gym", value, value)
                  )}
                </View>
                <Text style={styles.value}>
                  {labels[language].garden || "Garden"}:
                </Text>
                <View style={styles.radioGroup}>
                  {["Yes", "No"].map((value) =>
                    renderRadioButton(item.id, item, "garden", value, value)
                  )}
                </View>
                <Text style={styles.value}>
                  {labels[language].coWorkingSpace || "Co-working Space"}:
                </Text>
                <View style={styles.radioGroup}>
                  {["Yes", "No"].map((value) =>
                    renderRadioButton(
                      item.id,
                      item,
                      "co_working_space",
                      value,
                      value
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.imageContainer}>
          {editMode[item.id] ? (
            <TextInput
              style={styles.input}
              value={
                editedValues[item.id]?.images || item.images.join(", ") || ""
              }
              onChangeText={(text) => handleEdit(item.id, "images", text)}
              placeholder="Enter image URLs (comma-separated)"
            />
          ) : (
            <>
              <View style={styles.imageBackground}>
                <Carousel
                  ref={(ref) => {
                    if (ref) {
                      carouselRefs.current[item.id] = ref;
                    }
                  }}
                  width={200}
                  height={150}
                  data={
                    item.images.length > 0
                      ? item.images
                      : ["https://picsum.photos/150/100"]
                  }
                  scrollAnimationDuration={300}
                  defaultIndex={currentIndices[item.id] || 0}
                  onSnapToItem={(index) =>
                    setCurrentIndices((prev) => ({ ...prev, [item.id]: index }))
                  }
                  renderItem={({ item: image }) => (
                    <Image
                      source={{ uri: image }}
                      style={styles.innerImage}
                      onError={(error) =>
                        console.error(
                          "AdminCondo: Image load error for item",
                          item.id,
                          error.nativeEvent
                        )
                      }
                    />
                  )}
                />
              </View>
              {item.images.length === 1 && (
                <View style={styles.noImages}></View>
              )}
              {item.images.length > 1 && (
                <View style={styles.sliderControls}>
                  <TouchableOpacity onPress={() => handlePrev(item.id)}>
                    <Text style={styles.arrow}>{"<"}</Text>
                  </TouchableOpacity>
                  <FlatList
                    horizontal
                    contentContainerStyle={styles.indicatorContainer}
                    data={item.images}
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
          {editMode[item.id] ? (
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
                "Are you sure you want to delete this condo?"}
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

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <FlatList
          showsVerticalScrollIndicator={false}
          key={`flatlist-${numColumns}`}
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          ListEmptyComponent={
            <Text style={styles.title}>
              {labels[language].noCondos || "No condos available"}
            </Text>
          }
        />
      </View>
    </View>
  );
};

export default AdminCondo;
