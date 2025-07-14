import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/assets/styles/adminstyles/AddButtonStyles";
import { useJobs } from "@/hooks/useJobs";
import { useTravel } from "@/hooks/useTravel";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";
import { COLORS } from "@/constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// Define types
type JobType = {
  id: number;
  title: string;
  job_location: string;
  location?: string;
  created_at: string;
  notes?: string;
  pinkcard?: boolean;
  thai?: boolean;
  payment_type?: "Monthly" | "Daily";
  stay?: boolean;
  address?: string;
};

type TravelPostType = {
  id: number;
  name: string;
  place: string;
  applicants?: number;
  highlights: string[];
  images: string[];
  admin_rating: number;
  created_at: string;
};

interface AddButtonProps {
  type: "job" | "travel";
}

const AddButton: React.FC<AddButtonProps> = ({ type }) => {
  const { language } = useLanguage();
  const { addJob } = useJobs() as {
    addJob: (job: Partial<JobType>) => Promise<void>;
  };
  const travelHook = useTravel();
  console.log("useTravel hook result:", travelHook);
  const { addTravelPost } = travelHook || {};

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newJob, setNewJob] = useState<Partial<JobType>>({
    title: "",
    job_location: "",
    address: "",
    notes: "",
    pinkcard: undefined,
    thai: undefined,
    payment_type: undefined,
    stay: undefined,
  });
  const [newTravelPost, setNewTravelPost] = useState<Partial<TravelPostType>>({
    name: "",
    place: "",
    highlights: "",
    images: [],
    admin_rating: "",
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // For preview
  const MAX_IMAGES = 3; // Limit to 3 images
  const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB max payload size
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB max per image

  // Request permission for image picker
  const requestPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          labels[language].permissionDenied || "Permission Denied",
          labels[language].permissionMessage ||
            "Sorry, we need camera roll permissions to make this work!"
        );
        return false;
      }
    }
    return true;
  };

  // Pick and compress image, convert to base64
  const pickImage = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert(
        labels[language].error || "Error",
        labels[language].maxImages ||
          `Cannot add more than ${MAX_IMAGES} images`
      );
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert(
          labels[language].error || "Error",
          "Failed to get image data"
        );
        return;
      }

      // Compress image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const imageBase64 = compressedImage.base64 || base64;
      const base64String = `data:image/jpeg;base64,${imageBase64}`;

      // Check image size
      const sizeInBytes = (base64String.length * 3) / 4 - 2;
      if (sizeInBytes > MAX_IMAGE_SIZE) {
        Alert.alert(
          labels[language].error || "Error",
          labels[language].imageTooLarge || "Image size exceeds 2MB limit"
        );
        return;
      }

      setSelectedImages((prev) => [...prev, compressedImage.uri]);
      setNewTravelPost((prev) => ({
        ...prev,
        images: [...(prev.images || []), base64String],
      }));
    } else {
      console.log("Image selection canceled or failed:", result);
    }
  };

  // Handle job input changes
  const handleJobInputChange = <K extends keyof JobType>(
    field: K,
    value: JobType[K]
  ) => {
    setNewJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle travel post input changes
  const handleTravelInputChange = <K extends keyof TravelPostType>(
    field: K,
    value: TravelPostType[K] | string
  ) => {
    // For admin_rating, ensure only integer input
    if (field === "admin_rating") {
      const cleanedValue = value.toString().replace(/[^0-5]/g, ""); // Allow only 0-5
      setNewTravelPost((prev) => ({
        ...prev,
        [field]: cleanedValue,
      }));
    } else {
      setNewTravelPost((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Render radio button for job form
  const renderRadioButton = (
    field: keyof JobType,
    value: string | boolean,
    label: string
  ) => (
    <TouchableOpacity
      key={String(value)}
      style={styles.radioButton}
      onPress={() =>
        handleJobInputChange(
          field,
          value === "Yes" ? true : value === "No" ? false : value
        )
      }
    >
      <View style={styles.radioCircle}>
        {newJob[field] ===
          (value === "Yes" ? true : value === "No" ? false : value) && (
          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Perform job addition
  const performAddJob = async () => {
    try {
      const convertedJob: Partial<JobType> = {
        title: newJob.title?.trim(),
        job_location: newJob.job_location?.trim(),
        address: newJob.stay === true ? newJob.address?.trim() : undefined,
        notes: newJob.notes?.trim(),
        pinkcard: newJob.pinkcard,
        thai: newJob.thai,
        payment_type: newJob.payment_type,
        stay: newJob.stay,
      };

      if (!convertedJob.title || !convertedJob.job_location) {
        throw new Error(
          labels[language].requiredFields || "Title and Location are required"
        );
      }

      if (
        newJob.stay === true &&
        (!newJob.address || newJob.address.trim() === "")
      ) {
        throw new Error(
          labels[language].addressRequired ||
            "Address is required when Stay is 'Yes'"
        );
      }

      await addJob(convertedJob);
      setModalVisible(false);
      setNewJob({
        title: "",
        job_location: "",
        address: "",
        notes: "",
        pinkcard: undefined,
        thai: undefined,
        payment_type: undefined,
        stay: undefined,
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].jobAdded || "Job has been added!"
        );
      } else {
        window.alert(labels[language].jobAdded || "Job has been added!");
      }
    } catch (error) {
      console.error("Error adding job:", error);
      const errorMessage =
        error instanceof Error ? error.message : JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(`Failed to add job: ${errorMessage}`);
      } else {
        Alert.alert("Error", `Failed to add job: ${errorMessage}`);
      }
    }
  };

  // Perform travel post addition
  const performAddTravelPost = async () => {
    if (!addTravelPost) {
      console.error("addTravelPost is not defined in useTravel hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add travel post: Function not available"
      );
      return;
    }

    try {
      const convertedPost: Partial<TravelPostType> = {
        name: newTravelPost.name?.trim(),
        place: newTravelPost.place?.trim(),
        highlights:
          newTravelPost.highlights
            ?.split(",")
            .map((item) => item.trim())
            .filter((item) => item) || [],
        images: newTravelPost.images || [],
        admin_rating: newTravelPost.admin_rating
          ? parseInt(newTravelPost.admin_rating.toString())
          : 1, // Default to 1
      };

      if (!convertedPost.name || !convertedPost.place) {
        throw new Error(
          labels[language].requiredFields || "Name and Place are required"
        );
      }

      if (
        isNaN(convertedPost.admin_rating) ||
        convertedPost.admin_rating < 1 ||
        convertedPost.admin_rating > 5
      ) {
        throw new Error(
          labels[language].invalidRating ||
            "Rating must be an integer between 1 and 5"
        );
      }

      // Estimate payload size
      const payload = JSON.stringify(convertedPost);
      const payloadSize = new TextEncoder().encode(payload).length;
      if (payloadSize > MAX_PAYLOAD_SIZE) {
        throw new Error(
          labels[language].payloadTooLarge ||
            "Payload size exceeds server limit (5MB). Try fewer or smaller images."
        );
      }

      console.log("Payload size:", payloadSize, "bytes");
      console.log("Payload:", JSON.stringify(convertedPost, null, 2));

      await addTravelPost(convertedPost);
      setModalVisible(false);
      setNewTravelPost({
        name: "",
        place: "",
        highlights: "",
        images: [],
        admin_rating: "",
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].travelPostAdded || "Travel post has been added!"
        );
      } else {
        window.alert(
          labels[language].travelPostAdded || "Travel post has been added!"
        );
      }
    } catch (error: any) {
      console.error("Error adding travel post:", error);
      const errorMessage = error.response
        ? `Server responded with: ${JSON.stringify(error.response)}`
        : error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add travel post: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add travel post: ${errorMessage}`
        );
      }
    }
  };

  // Handle addition with platform-specific confirmation
  const handleAdd = () => {
    const isJob = type === "job";
    const confirmMessage = isJob
      ? labels[language].addConfirm || "Are you sure you want to add this job?"
      : labels[language].addConfirm ||
        "Are you sure you want to add this travel post?";
    const title = isJob
      ? labels[language].addJob || "Add Job"
      : labels[language].addTravelPost || "Add Travel Post";
    const performAction = isJob ? performAddJob : performAddTravelPost;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(confirmMessage);
      if (confirmed) {
        performAction();
      }
    } else {
      Alert.alert(
        title,
        confirmMessage,
        [
          {
            text: labels[language].cancel || "Cancel",
            style: "cancel",
          },
          {
            text: labels[language].add || "Add",
            style: "default",
            onPress: performAction,
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Render job form
  const renderJobForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].title || "Title"}:</Text>
        <TextInput
          style={styles.input}
          value={newJob.title}
          onChangeText={(text) => handleJobInputChange("title", text)}
          placeholder={labels[language].title || "Enter title"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].location || "Location"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newJob.job_location}
          onChangeText={(text) => handleJobInputChange("job_location", text)}
          placeholder={labels[language].location || "Enter location"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].pinkCard || "Pink Card"}:
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("pinkcard", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].thai || "Thai"}:</Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("thai", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].paymentType || "Payment Type"}:
        </Text>
        <View style={styles.radioGroup}>
          {["Monthly", "Daily"].map((value) =>
            renderRadioButton("payment_type", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].stay || "Stay"}:</Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("stay", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].address || "Address"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newJob.address || ""}
          onChangeText={(text) => handleJobInputChange("address", text)}
          placeholder={
            labels[language].addressRequired ||
            "Enter address when Stay is 'Yes'"
          }
          editable={newJob.stay === true}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
        <TextInput
          style={styles.input}
          value={newJob.notes || ""}
          onChangeText={(text) => handleJobInputChange("notes", text)}
          placeholder={labels[language].notes || "Enter notes"}
        />
      </View>
    </>
  );

  // Render travel post form
  const renderTravelPostForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
        <TextInput
          style={styles.input}
          value={newTravelPost.name}
          onChangeText={(text) => handleTravelInputChange("name", text)}
          placeholder={labels[language].name || "Enter name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].place || "Place"}:</Text>
        <TextInput
          style={styles.input}
          value={newTravelPost.place}
          onChangeText={(text) => handleTravelInputChange("place", text)}
          placeholder={labels[language].place || "Enter place"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].highlights || "Highlights"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newTravelPost.highlights}
          onChangeText={(text) => handleTravelInputChange("highlights", text)}
          placeholder={
            labels[language].highlights || "Enter highlights (comma-separated)"
          }
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].images || "Images"}:</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ScrollView
            horizontal
            style={{ flexDirection: "row", maxHeight: 100 }}
          >
            {selectedImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={[styles.imagePreview, { marginLeft: 10 }]}
              />
            ))}
            <TouchableOpacity
              style={[
                styles.imageInput,
                { marginLeft: selectedImages.length > 0 ? 10 : 0 },
              ]}
              onPress={pickImage}
            >
              <Ionicons name="add" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].adminRating || "Rating"}:
        </Text>
        <TextInput
          style={styles.input}
          value={
            newTravelPost.admin_rating !== undefined
              ? String(newTravelPost.admin_rating)
              : ""
          }
          onChangeText={(text) => handleTravelInputChange("admin_rating", text)}
          placeholder={labels[language].adminRating || "Enter rating (1-5)"}
          keyboardType="number-pad"
        />
      </View>
    </>
  );

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={require("@/assets/images/add.png")}
          style={styles.icon}
        />
      </TouchableOpacity>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalText}>
                {type === "job"
                  ? labels[language].addJob || "Add New Job"
                  : labels[language].addTravelPost || "Add New Travel Post"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {type === "job" ? renderJobForm() : renderTravelPostForm()}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addButtonModal]}
                  onPress={handleAdd}
                >
                  <Text style={styles.modalButtonText}>
                    {labels[language].add || "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AddButton;
