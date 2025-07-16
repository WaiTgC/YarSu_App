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
import { useCondos } from "@/hooks/useCondos";
import { useHotels } from "@/hooks/useHotels";
import { useCourses } from "@/hooks/useCourses"; // Import useCourses hook
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

type HotelType = {
  id: number;
  name: string;
  address: string;
  price: number;
  nearby_famous_places: string[];
  breakfast: boolean;
  free_wifi: boolean;
  swimming_pool: boolean;
  images: string[];
  notes?: string;
  admin_rating: number;
  created_at: string;
};

type CourseType = {
  id: number;
  name: string;
  duration: string;
  price: number;
  centre_name: string;
  location: string;
};

interface AddButtonProps {
  type: "job" | "travel" | "condo" | "hotel" | "course";
}

const AddButton: React.FC<AddButtonProps> = ({ type }) => {
  const { language } = useLanguage();
  const { addJob } = useJobs() as {
    addJob: (job: Partial<JobType>) => Promise<void>;
  };
  const travelHook = useTravel();
  const { addTravelPost } = travelHook || {};
  const { addCondo, loadCondos } = useCondos();
  const hotelHook = useHotels();
  const { addHotel, loadHotels } = hotelHook || {};
  const courseHook = useCourses(); // Get useCourses hook
  const { createCourse, loadCourses } = courseHook || {}; // Destructure createCourse and loadCourses

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
  const [newCondo, setNewCondo] = useState<Partial<CondoType>>({
    name: "",
    address: "",
    rent_fee: "",
    images: [],
    swimming_pool: undefined,
    free_wifi: undefined,
    gym: undefined,
    garden: undefined,
    co_working_space: undefined,
  });
  const [newHotel, setNewHotel] = useState<Partial<HotelType>>({
    name: "",
    address: "",
    price: "",
    nearby_famous_places: "",
    breakfast: undefined,
    free_wifi: undefined,
    swimming_pool: undefined,
    images: [],
    notes: "",
    admin_rating: "",
  });
  const [newCourse, setNewCourse] = useState<Partial<CourseType>>({
    name: "",
    duration: "",
    price: "",
    centre_name: "",
    location: "",
  }); // State for course
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const MAX_IMAGES = 3;

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
      setSelectedImages((prev) => [...prev, compressedImage.uri]);
      if (type === "travel") {
        setNewTravelPost((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      } else if (type === "condo") {
        setNewCondo((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      } else if (type === "hotel") {
        setNewHotel((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      }
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
    if (field === "admin_rating") {
      const cleanedValue = value.toString().replace(/[^0-5]/g, "");
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

  // Handle condo input changes
  const handleCondoInputChange = <K extends keyof CondoType>(
    field: K,
    value: CondoType[K] | string | boolean
  ) => {
    if (
      [
        "swimming_pool",
        "free_wifi",
        "gym",
        "garden",
        "co_working_space",
      ].includes(field)
    ) {
      setNewCondo((prev) => ({
        ...prev,
        [field]: value === true,
      }));
    } else {
      setNewCondo((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle hotel input changes
  const handleHotelInputChange = <K extends keyof HotelType>(
    field: K,
    value: HotelType[K] | string | boolean
  ) => {
    if (["breakfast", "free_wifi", "swimming_pool"].includes(field)) {
      setNewHotel((prev) => ({
        ...prev,
        [field]: value === true,
      }));
    } else if (field === "price" || field === "admin_rating") {
      const cleanedValue = value.toString().replace(/[^0-9]/g, "");
      setNewHotel((prev) => ({
        ...prev,
        [field]: cleanedValue,
      }));
    } else {
      setNewHotel((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle course input changes
  const handleCourseInputChange = <K extends keyof CourseType>(
    field: K,
    value: CourseType[K] | string
  ) => {
    if (field === "price") {
      const cleanedValue = value.toString().replace(/[^0-9]/g, "");
      setNewCourse((prev) => ({
        ...prev,
        [field]: cleanedValue,
      }));
    } else {
      setNewCourse((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Render radio button
  const renderRadioButton = (field: string, value: string, label: string) => (
    <TouchableOpacity
      key={field + value}
      style={styles.radioButton}
      onPress={() => {
        if (type === "job") {
          handleJobInputChange(
            field as keyof JobType,
            value === "Yes" ? true : false
          );
        } else if (type === "hotel") {
          handleHotelInputChange(
            field as keyof HotelType,
            value === "Yes" ? true : false
          );
        }
      }}
    >
      <View style={styles.radioCircle}>
        {(type === "job" &&
          newJob[field as keyof JobType] ===
            (value === "Yes" ? true : false)) ||
        (type === "hotel" &&
          newHotel[field as keyof HotelType] ===
            (value === "Yes" ? true : false)) ? (
          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
        ) : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Render service radio for condo
  const renderServiceRadio = (field: keyof CondoType, label: string) => (
    <TouchableOpacity
      key={field}
      style={styles.radioButton}
      onPress={() => handleCondoInputChange(field, !newCondo[field])}
    >
      <View style={styles.radioCircle}>
        {newCondo[field] === true && (
          <Ionicons name="checkmark" size={16} color={COLORS.primary} />
        )}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Perform course addition
  const performAddCourse = async () => {
    if (!createCourse) {
      console.error("createCourse is not defined in useCourses hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add course: Function not available"
      );
      return;
    }

    try {
      const convertedCourse: Partial<CourseType> = {
        name: newCourse.name?.trim(),
        duration: newCourse.duration?.trim(),
        price: newCourse.price
          ? parseInt(newCourse.price.toString())
          : undefined,
        centre_name: newCourse.centre_name?.trim(),
        location: newCourse.location?.trim(),
      };

      if (
        !convertedCourse.name ||
        !convertedCourse.duration ||
        !convertedCourse.centre_name ||
        !convertedCourse.location
      ) {
        throw new Error(
          labels[language].requiredFields ||
            "Name, Duration, Centre Name, and Location are required"
        );
      }

      if (
        convertedCourse.price !== undefined &&
        (isNaN(convertedCourse.price) || convertedCourse.price <= 0)
      ) {
        throw new Error(
          labels[language].invalidPrice || "Price must be a positive number"
        );
      }

      console.log("Payload:", JSON.stringify(convertedCourse, null, 2));
      await createCourse(convertedCourse);
      await loadCourses();
      setModalVisible(false);
      setNewCourse({
        name: "",
        duration: "",
        price: "",
        centre_name: "",
        location: "",
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].courseAdded || "Course has been added!"
        );
      } else {
        window.alert(labels[language].courseAdded || "Course has been added!");
      }
    } catch (error: any) {
      console.error("Error adding course:", error);
      const errorMessage = error.response
        ? `Server responded with: ${JSON.stringify(error.response)}`
        : error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add course: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add course: ${errorMessage}`
        );
      }
    }
  };

  // Handle addition with platform-specific confirmation
  const handleAdd = () => {
    const isJob = type === "job";
    const isTravel = type === "travel";
    const isCondo = type === "condo";
    const isHotel = type === "hotel";
    const isCourse = type === "course";
    const confirmMessage = isJob
      ? labels[language].addConfirm || "Are you sure you want to add this job?"
      : isTravel
      ? labels[language].addConfirm ||
        "Are you sure you want to add this travel post?"
      : isCondo
      ? labels[language].addConfirm ||
        "Are you sure you want to add this condo?"
      : isHotel
      ? labels[language].addConfirm ||
        "Are you sure you want to add this hotel?"
      : isCourse
      ? labels[language].addConfirm ||
        "Are you sure you want to add this course?"
      : "";
    const title = isJob
      ? labels[language].addJob || "Add Job"
      : isTravel
      ? labels[language].addTravelPost || "Add Travel Post"
      : isCondo
      ? labels[language].addCondo || "Add Condo"
      : isHotel
      ? labels[language].addHotel || "Add Hotel"
      : isCourse
      ? labels[language].addCourse || "Add Course"
      : "";
    const performAction = isJob
      ? performAddJob
      : isTravel
      ? performAddTravelPost
      : isCondo
      ? performAddCondo
      : isHotel
      ? performAddHotel
      : isCourse
      ? performAddCourse
      : () => {};

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

  // Render course form
  const renderCourseForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
        <TextInput
          style={styles.input}
          value={newCourse.name || ""}
          onChangeText={(text) => handleCourseInputChange("name", text)}
          placeholder={labels[language].name || "Enter name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].duration || "Duration"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newCourse.duration || ""}
          onChangeText={(text) => handleCourseInputChange("duration", text)}
          placeholder={labels[language].duration || "Enter duration"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].price || "Price"}:</Text>
        <TextInput
          style={styles.input}
          value={newCourse.price || ""}
          onChangeText={(text) => handleCourseInputChange("price", text)}
          placeholder={labels[language].price || "Enter price"}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].centreName || "Centre Name"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newCourse.centre_name || ""}
          onChangeText={(text) => handleCourseInputChange("centre_name", text)}
          placeholder={labels[language].centreName || "Enter centre name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].location || "Location"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newCourse.location || ""}
          onChangeText={(text) => handleCourseInputChange("location", text)}
          placeholder={labels[language].location || "Enter location"}
        />
      </View>
    </>
  );

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
        <ScrollView horizontal style={{ flexDirection: "row", maxHeight: 100 }}>
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

  // Render condo form
  const renderCondoForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
        <TextInput
          style={styles.input}
          value={newCondo.name || ""}
          onChangeText={(text) => handleCondoInputChange("name", text)}
          placeholder={labels[language].name || "Enter name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].address || "Address"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newCondo.address || ""}
          onChangeText={(text) => handleCondoInputChange("address", text)}
          placeholder={labels[language].address || "Enter address"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].rentFee || "Rent Fee"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newCondo.rent_fee || ""}
          onChangeText={(text) => handleCondoInputChange("rent_fee", text)}
          placeholder={labels[language].rentFee || "Enter rent fee"}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].services || "Services"}:
        </Text>
        <View style={styles.serviceContainer}>
          {renderServiceRadio(
            "swimming_pool",
            labels[language].swimmingPool || "Swimming Pool"
          )}
          {renderServiceRadio(
            "free_wifi",
            labels[language].freeWifi || "Free Wi-Fi"
          )}
          {renderServiceRadio("gym", labels[language].gym || "Gym")}
          {renderServiceRadio("garden", labels[language].garden || "Garden")}
          {renderServiceRadio(
            "co_working_space",
            labels[language].coWorkingSpace || "Co-working Space"
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].images || "Images"}:</Text>
        <ScrollView horizontal style={{ flexDirection: "row", maxHeight: 100 }}>
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
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
        <TextInput
          style={styles.input}
          value={newCondo.notes || ""}
          onChangeText={(text) => handleCondoInputChange("notes", text)}
          placeholder={labels[language].notes || "Enter notes"}
        />
      </View>
    </>
  );

  // Render hotel form
  const renderHotelForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
        <TextInput
          style={styles.input}
          value={newHotel.name || ""}
          onChangeText={(text) => handleHotelInputChange("name", text)}
          placeholder={labels[language].name || "Enter name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].address || "Address"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newHotel.address || ""}
          onChangeText={(text) => handleHotelInputChange("address", text)}
          placeholder={labels[language].address || "Enter address"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].price || "Price"}:</Text>
        <TextInput
          style={styles.input}
          value={newHotel.price || ""}
          onChangeText={(text) => handleHotelInputChange("price", text)}
          placeholder={labels[language].price || "Enter price"}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].nearbyPlaces || "Nearby Places"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newHotel.nearby_famous_places || ""}
          onChangeText={(text) =>
            handleHotelInputChange("nearby_famous_places", text)
          }
          placeholder={
            labels[language].nearbyPlaces ||
            "Enter nearby places (comma-separated)"
          }
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].breakfast || "Breakfast"}:
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("breakfast", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].wifi || "Free Wi-Fi"}:
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("free_wifi", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].swimmingPool || "Swimming Pool"}:
        </Text>
        <View style={styles.radioGroup}>
          {["Yes", "No"].map((value) =>
            renderRadioButton("swimming_pool", value, value)
          )}
        </View>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].images || "Images"}:</Text>
        <ScrollView horizontal style={{ flexDirection: "row", maxHeight: 100 }}>
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
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
        <TextInput
          style={styles.input}
          value={newHotel.notes || ""}
          onChangeText={(text) => handleHotelInputChange("notes", text)}
          placeholder={labels[language].notes || "Enter notes"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].adminRating || "Rating"}:
        </Text>
        <TextInput
          style={styles.input}
          value={
            newHotel.admin_rating !== undefined
              ? String(newHotel.admin_rating)
              : ""
          }
          onChangeText={(text) => handleHotelInputChange("admin_rating", text)}
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
                  : type === "travel"
                  ? labels[language].addTravelPost || "Add New Travel Post"
                  : type === "condo"
                  ? labels[language].addCondo || "Add New Condo"
                  : type === "hotel"
                  ? labels[language].addHotel || "Add New Hotel"
                  : type === "course"
                  ? labels[language].addCourse || "Add New Course" // Add course label
                  : ""}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {type === "job"
                ? renderJobForm()
                : type === "travel"
                ? renderTravelPostForm()
                : type === "condo"
                ? renderCondoForm()
                : type === "hotel"
                ? renderHotelForm()
                : type === "course"
                ? renderCourseForm() // Add course form
                : null}
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
