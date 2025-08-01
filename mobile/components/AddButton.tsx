import React, { useState, useCallback } from "react";
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
import { useCourses } from "@/hooks/useCourses";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useDoc } from "@/hooks/useDoc";
import { useGeneral } from "@/hooks/useGeneral";
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
  notes?: string;
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

type RestaurantType = {
  id: number;
  name: string;
  location: string;
  popular_picks: string[];
  images: string[];
  admin_rating: number;
  notes?: string;
  created_at: string;
};

type DocPostType = {
  id: number;
  text: string;
  images: string[];
  videos: string[];
};

type GeneralPostType = {
  id: number;
  text: string;
  images: string[];
  videos: string[];
};

interface AddButtonProps {
  type:
    | "job"
    | "travel"
    | "condo"
    | "hotel"
    | "course"
    | "restaurant"
    | "doc"
    | "general";
}

const AddButton: React.FC<AddButtonProps> = ({ type }) => {
  const { language } = useLanguage();
  const { addJob, loadJobs } = useJobs() as {
    addJob: (job: Partial<JobType>) => Promise<void>;
    loadJobs: () => Promise<void>;
  };
  const { addTravelPost, loadTravelPosts } = useTravel() as {
    addTravelPost: (post: Partial<TravelPostType>) => Promise<void>;
    loadTravelPosts: () => Promise<void>;
  };
  const { addCondo, loadCondos } = useCondos() as {
    addCondo: (condo: Partial<CondoType>) => Promise<void>;
    loadCondos: () => Promise<void>;
  };
  const { addHotel, loadHotels } = useHotels() as {
    addHotel: (hotel: Partial<HotelType>) => Promise<void>;
    loadHotels: () => Promise<void>;
  };
  const { createCourse, loadCourses } = useCourses() as {
    createCourse: (course: Partial<CourseType>) => Promise<void>;
    loadCourses: () => Promise<void>;
  };
  const { createRestaurant, loadRestaurants } = useRestaurants() as {
    createRestaurant: (restaurant: Partial<RestaurantType>) => Promise<void>;
    loadRestaurants: () => Promise<void>;
  };
  const { addDocPost, loadDocPosts } = useDoc() as {
    addDocPost: (post: Partial<DocPostType>) => Promise<void>;
    loadDocPosts: () => Promise<void>;
  };
  const { addGeneralPost, loadGeneralPosts } = useGeneral() as {
    addGeneralPost: (post: Partial<GeneralPostType>) => Promise<void>;
    loadGeneralPosts: () => Promise<void>;
  };

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
    swimming_pool: false,
    free_wifi: false,
    gym: false,
    garden: false,
    co_working_space: false,
    notes: "",
  });
  const [newHotel, setNewHotel] = useState<Partial<HotelType>>({
    name: "",
    address: "",
    price: "",
    nearby_famous_places: "",
    breakfast: false,
    free_wifi: false,
    swimming_pool: false,
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
  });
  const [newRestaurant, setNewRestaurant] = useState<Partial<RestaurantType>>({
    name: "",
    location: "",
    popular_picks: "",
    images: [],
    admin_rating: "",
    notes: "",
  });
  const [newDocPost, setNewDocPost] = useState<Partial<DocPostType>>({
    text: "",
    images: [],
    videos: [],
  });
  const [newGeneralPost, setNewGeneralPost] = useState<
    Partial<GeneralPostType>
  >({
    text: "",
    images: [],
    videos: [],
  });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const MAX_IMAGES = 3;
  const MAX_VIDEOS = 3;

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
      } else if (type === "restaurant") {
        setNewRestaurant((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      } else if (type === "doc") {
        setNewDocPost((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      } else if (type === "general") {
        setNewGeneralPost((prev) => ({
          ...prev,
          images: [...(prev.images || []), base64String],
        }));
      }
    } else {
      console.log("Image selection canceled or failed:", result);
    }
  };

  // Pick video, convert to base64
  const pickVideo = async () => {
    if (selectedVideos.length >= MAX_VIDEOS) {
      Alert.alert(
        labels[language].error || "Error",
        `Cannot add more than ${MAX_VIDEOS} videos`
      );
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      if (!base64) {
        Alert.alert(
          labels[language].error || "Error",
          "Failed to get video data"
        );
        return;
      }

      const base64String = `data:video/mp4;base64,${base64}`;
      setSelectedVideos((prev) => [...prev, uri]);
      if (type === "doc") {
        setNewDocPost((prev) => ({
          ...prev,
          videos: [...(prev.videos || []), base64String],
        }));
      } else if (type === "general") {
        setNewGeneralPost((prev) => ({
          ...prev,
          videos: [...(prev.videos || []), base64String],
        }));
      }
    } else {
      console.log("Video selection canceled or failed:", result);
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
      const cleanedValue = value.toString().replace(/[^0-5.]/g, "");
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
    } else if (field === "rent_fee") {
      const cleanedValue = value.toString().replace(/[^0-9]/g, "");
      setNewCondo((prev) => ({
        ...prev,
        [field]: cleanedValue,
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
      const cleanedValue = value.toString().replace(/[^0-9.]/g, "");
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

  // Handle restaurant input changes
  const handleRestaurantInputChange = <K extends keyof RestaurantType>(
    field: K,
    value: RestaurantType[K] | string
  ) => {
    if (field === "admin_rating") {
      const cleanedValue = value.toString().replace(/[^0-5.]/g, "");
      setNewRestaurant((prev) => ({
        ...prev,
        [field]: cleanedValue,
      }));
    } else {
      setNewRestaurant((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle doc post input changes
  const handleDocInputChange = <K extends keyof DocPostType>(
    field: K,
    value: DocPostType[K]
  ) => {
    setNewDocPost((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle general post input changes
  const handleGeneralInputChange = <K extends keyof GeneralPostType>(
    field: K,
    value: GeneralPostType[K]
  ) => {
    setNewGeneralPost((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            value === "Yes" ? true : value === "Monthly" ? value : false
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
            (value === "Yes"
              ? true
              : value === "Monthly" || value === "Daily"
              ? value
              : false)) ||
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

  // Perform job addition
  const performAddJob = async () => {
    if (!addJob) {
      console.error("addJob is not defined in useJobs hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add job: Function not available"
      );
      return;
    }

    try {
      const convertedJob: Partial<JobType> = {
        title: newJob.title?.trim(),
        job_location: newJob.job_location?.trim(),
        address: newJob.stay ? newJob.address?.trim() : undefined,
        notes: newJob.notes?.trim(),
        pinkcard: newJob.pinkcard,
        thai: newJob.thai,
        payment_type: newJob.payment_type as "Monthly" | "Daily" | undefined,
        stay: newJob.stay,
      };

      if (!convertedJob.title || !convertedJob.job_location) {
        throw new Error(
          labels[language].requiredFields || "Title and Location are required"
        );
      }

      if (convertedJob.stay && !convertedJob.address) {
        throw new Error(
          labels[language].addressRequired ||
            "Address is required when Stay is Yes"
        );
      }

      console.log("Job Payload:", JSON.stringify(convertedJob, null, 2));
      await addJob(convertedJob);
      await loadJobs();
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
    } catch (error: any) {
      console.error("Error adding job:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add job: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add job: ${errorMessage}`
        );
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
      const convertedTravelPost: Partial<TravelPostType> = {
        name: newTravelPost.name?.trim(),
        place: newTravelPost.place?.trim(),
        highlights: newTravelPost.highlights
          ? newTravelPost.highlights
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [],
        images: newTravelPost.images || [],
        admin_rating: newTravelPost.admin_rating
          ? parseFloat(newTravelPost.admin_rating.toString())
          : undefined,
      };

      if (!convertedTravelPost.name || !convertedTravelPost.place) {
        throw new Error(
          labels[language].requiredFields || "Name and Place are required"
        );
      }

      if (
        convertedTravelPost.admin_rating !== undefined &&
        (isNaN(convertedTravelPost.admin_rating) ||
          convertedTravelPost.admin_rating < 0 ||
          convertedTravelPost.admin_rating > 5)
      ) {
        throw new Error(
          labels[language].invalidRating ||
            "Rating must be a number between 0 and 5"
        );
      }

      console.log(
        "Travel Post Payload:",
        JSON.stringify(convertedTravelPost, null, 2)
      );
      await addTravelPost(convertedTravelPost);
      await loadTravelPosts();
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
      const errorMessage = error.message || JSON.stringify(error);
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

  // Perform condo addition
  const performAddCondo = async () => {
    if (!addCondo) {
      console.error("addCondo is not defined in useCondos hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add condo: Function not available"
      );
      return;
    }

    try {
      const convertedCondo: Partial<CondoType> = {
        name: newCondo.name?.trim(),
        address: newCondo.address?.trim(),
        rent_fee: newCondo.rent_fee
          ? parseInt(newCondo.rent_fee.toString())
          : undefined,
        images: newCondo.images || [],
        swimming_pool: newCondo.swimming_pool ?? false,
        free_wifi: newCondo.free_wifi ?? false,
        gym: newCondo.gym ?? false,
        garden: newCondo.garden ?? false,
        co_working_space: newCondo.co_working_space ?? false,
        notes: newCondo.notes?.trim(),
      };

      if (!convertedCondo.name || !convertedCondo.address) {
        throw new Error(
          labels[language].requiredFields || "Name and Address are required"
        );
      }

      if (
        convertedCondo.rent_fee !== undefined &&
        (isNaN(convertedCondo.rent_fee) || convertedCondo.rent_fee <= 0)
      ) {
        throw new Error(
          labels[language].invalidRentFee ||
            "Rent fee must be a positive number"
        );
      }

      console.log("Condo Payload:", JSON.stringify(convertedCondo, null, 2));
      await addCondo(convertedCondo);
      await loadCondos();
      setModalVisible(false);
      setNewCondo({
        name: "",
        address: "",
        rent_fee: "",
        images: [],
        swimming_pool: false,
        free_wifi: false,
        gym: false,
        garden: false,
        co_working_space: false,
        notes: "",
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].condoAdded || "Condo has been added!"
        );
      } else {
        window.alert(labels[language].condoAdded || "Condo has been added!");
      }
    } catch (error: any) {
      console.error("Error adding condo:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add condo: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add condo: ${errorMessage}`
        );
      }
    }
  };

  // Perform hotel addition
  const performAddHotel = async () => {
    if (!addHotel) {
      console.error("addHotel is not defined in useHotels hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add hotel: Function not available"
      );
      return;
    }

    try {
      const convertedHotel: Partial<HotelType> = {
        name: newHotel.name?.trim(),
        address: newHotel.address?.trim(),
        price: newHotel.price ? parseInt(newHotel.price.toString()) : undefined,
        nearby_famous_places: newHotel.nearby_famous_places
          ? newHotel.nearby_famous_places
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [],
        breakfast: newHotel.breakfast ?? false,
        free_wifi: newHotel.free_wifi ?? false,
        swimming_pool: newHotel.swimming_pool ?? false,
        images: newHotel.images || [],
        notes: newHotel.notes?.trim(),
        admin_rating: newHotel.admin_rating
          ? parseFloat(newHotel.admin_rating.toString())
          : undefined,
      };

      if (!convertedHotel.name || !convertedHotel.address) {
        throw new Error(
          labels[language].requiredFields || "Name and Address are required"
        );
      }

      if (
        convertedHotel.price !== undefined &&
        (isNaN(convertedHotel.price) || convertedHotel.price <= 0)
      ) {
        throw new Error(
          labels[language].invalidPrice || "Price must be a positive number"
        );
      }

      if (
        convertedHotel.admin_rating !== undefined &&
        (isNaN(convertedHotel.admin_rating) ||
          convertedHotel.admin_rating < 0 ||
          convertedHotel.admin_rating > 5)
      ) {
        throw new Error(
          labels[language].invalidRating ||
            "Rating must be a number between 0 and 5"
        );
      }

      console.log("Hotel Payload:", JSON.stringify(convertedHotel, null, 2));
      await addHotel(convertedHotel);
      await loadHotels();
      setModalVisible(false);
      setNewHotel({
        name: "",
        address: "",
        price: "",
        nearby_famous_places: "",
        breakfast: false,
        free_wifi: false,
        swimming_pool: false,
        images: [],
        notes: "",
        admin_rating: "",
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].hotelAdded || "Hotel has been added!"
        );
      } else {
        window.alert(labels[language].hotelAdded || "Hotel has been added!");
      }
    } catch (error: any) {
      console.error("Error adding hotel:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add hotel: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add hotel: ${errorMessage}`
        );
      }
    }
  };

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

      console.log("Course Payload:", JSON.stringify(convertedCourse, null, 2));
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
      const errorMessage = error.message || JSON.stringify(error);
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

  // Perform restaurant addition
  const performAddRestaurant = useCallback(async () => {
    if (!createRestaurant) {
      console.error("createRestaurant is not defined in useRestaurants hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add restaurant: Function not available"
      );
      return;
    }

    try {
      const convertedRestaurant: Partial<RestaurantType> = {
        name: newRestaurant.name?.trim(),
        location: newRestaurant.location?.trim(),
        popular_picks: newRestaurant.popular_picks
          ? newRestaurant.popular_picks
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [],
        images: newRestaurant.images || [],
        admin_rating: newRestaurant.admin_rating
          ? parseFloat(newRestaurant.admin_rating.toString())
          : undefined,
        notes: newRestaurant.notes?.trim(),
      };

      if (!convertedRestaurant.name || !convertedRestaurant.location) {
        throw new Error(
          labels[language].requiredFields || "Name and Location are required"
        );
      }

      if (
        convertedRestaurant.admin_rating !== undefined &&
        (isNaN(convertedRestaurant.admin_rating) ||
          convertedRestaurant.admin_rating < 0 ||
          convertedRestaurant.admin_rating > 5)
      ) {
        throw new Error(
          labels[language].invalidRating ||
            "Rating must be a number between 0 and 5"
        );
      }

      console.log(
        "Restaurant Payload:",
        JSON.stringify(convertedRestaurant, null, 2)
      );
      await createRestaurant(convertedRestaurant);
      await loadRestaurants();
      setModalVisible(false);
      setNewRestaurant({
        name: "",
        location: "",
        popular_picks: "",
        images: [],
        admin_rating: "",
        notes: "",
      });
      setSelectedImages([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].restaurantAdded || "Restaurant has been added!"
        );
      } else {
        window.alert(
          labels[language].restaurantAdded || "Restaurant has been added!"
        );
      }
    } catch (error: any) {
      console.error("Error adding restaurant:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add restaurant: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add restaurant: ${errorMessage}`
        );
      }
    }
  }, [createRestaurant, loadRestaurants, newRestaurant, language]);

  // Perform doc post addition
  const performAddDocPost = useCallback(async () => {
    if (!addDocPost) {
      console.error("addDocPost is not defined in useDoc hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add document post: Function not available"
      );
      return;
    }

    try {
      const convertedDocPost: Partial<DocPostType> = {
        text: newDocPost.text?.trim(),
        images: newDocPost.images || [],
        videos: newDocPost.videos || [],
      };

      if (
        !convertedDocPost.text &&
        (!convertedDocPost.images || convertedDocPost.images.length === 0) &&
        (!convertedDocPost.videos || convertedDocPost.videos.length === 0)
      ) {
        throw new Error(
          labels[language].requiredFields ||
            "At least one of text, images, or videos is required"
        );
      }

      console.log(
        "Doc Post Payload:",
        JSON.stringify(convertedDocPost, null, 2)
      );
      await addDocPost(convertedDocPost);
      await loadDocPosts();
      setModalVisible(false);
      setNewDocPost({
        text: "",
        images: [],
        videos: [],
      });
      setSelectedImages([]);
      setSelectedVideos([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].docPostAdded || "Document post has been added!"
        );
      } else {
        window.alert(
          labels[language].docPostAdded || "Document post has been added!"
        );
      }
    } catch (error: any) {
      console.error("Error adding doc post:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error || `Failed to add doc post: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add doc post: ${errorMessage}`
        );
      }
    }
  }, [addDocPost, loadDocPosts, newDocPost, language]);

  // Perform general post addition
  const performAddGeneralPost = useCallback(async () => {
    if (!addGeneralPost) {
      console.error("addGeneralPost is not defined in useGeneral hook");
      Alert.alert(
        labels[language].error || "Error",
        labels[language].errorMessage ||
          "Failed to add general post: Function not available"
      );
      return;
    }

    try {
      const convertedGeneralPost: Partial<GeneralPostType> = {
        text: newGeneralPost.text?.trim(),
        images: newGeneralPost.images || [],
        videos: newGeneralPost.videos || [],
      };

      if (
        !convertedGeneralPost.text &&
        (!convertedGeneralPost.images ||
          convertedGeneralPost.images.length === 0) &&
        (!convertedGeneralPost.videos ||
          convertedGeneralPost.videos.length === 0)
      ) {
        throw new Error(
          labels[language].requiredFields ||
            "At least one of text, images, or videos is required"
        );
      }

      console.log(
        "General Post Payload:",
        JSON.stringify(convertedGeneralPost, null, 2)
      );
      await addGeneralPost(convertedGeneralPost);
      await loadGeneralPosts();
      setModalVisible(false);
      setNewGeneralPost({
        text: "",
        images: [],
        videos: [],
      });
      setSelectedImages([]);
      setSelectedVideos([]);

      if (Platform.OS !== "web") {
        Alert.alert(
          labels[language].added || "Added",
          labels[language].generalPostAdded || "General post has been added!"
        );
      } else {
        window.alert(
          labels[language].generalPostAdded || "General post has been added!"
        );
      }
    } catch (error: any) {
      console.error("Error adding general post:", error);
      const errorMessage = error.message || JSON.stringify(error);
      if (Platform.OS === "web") {
        window.alert(
          labels[language].error ||
            `Failed to add general post: ${errorMessage}`
        );
      } else {
        Alert.alert(
          labels[language].error || "Error",
          `Failed to add general post: ${errorMessage}`
        );
      }
    }
  }, [addGeneralPost, loadGeneralPosts, newGeneralPost, language]);

  // Handle addition with platform-specific confirmation
  const handleAdd = () => {
    const isJob = type === "job";
    const isTravel = type === "travel";
    const isCondo = type === "condo";
    const isHotel = type === "hotel";
    const isCourse = type === "course";
    const isRestaurant = type === "restaurant";
    const isDoc = type === "doc";
    const isGeneral = type === "general";
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
      : isRestaurant
      ? labels[language].addConfirm ||
        "Are you sure you want to add this restaurant?"
      : isDoc
      ? labels[language].addConfirm ||
        "Are you sure you want to add this document post?"
      : isGeneral
      ? labels[language].addConfirm ||
        "Are you sure you want to add this general post?"
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
      : isRestaurant
      ? labels[language].addRestaurant || "Add Restaurant"
      : isDoc
      ? labels[language].addDocPost || "Add Document Post"
      : isGeneral
      ? labels[language].addGeneralPost || "Add General Post"
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
      : isRestaurant
      ? performAddRestaurant
      : isDoc
      ? performAddDocPost
      : isGeneral
      ? performAddGeneralPost
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
          placeholder={labels[language].adminRating || "Enter rating (0-5)"}
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
          placeholder={labels[language].adminRating || "Enter rating (0-5)"}
          keyboardType="number-pad"
        />
      </View>
    </>
  );

  // Render restaurant form
  const renderRestaurantForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].name || "Name"}:</Text>
        <TextInput
          style={styles.input}
          value={newRestaurant.name || ""}
          onChangeText={(text) => handleRestaurantInputChange("name", text)}
          placeholder={labels[language].name || "Enter name"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].location || "Location"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newRestaurant.location || ""}
          onChangeText={(text) => handleRestaurantInputChange("location", text)}
          placeholder={labels[language].location || "Enter location"}
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>
          {labels[language].popular || "Popular Picks"}:
        </Text>
        <TextInput
          style={styles.input}
          value={newRestaurant.popular_picks || ""}
          onChangeText={(text) =>
            handleRestaurantInputChange("popular_picks", text)
          }
          placeholder={
            labels[language].popularPicks ||
            "Enter popular dishes (comma-separated)"
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
            newRestaurant.admin_rating !== undefined
              ? String(newRestaurant.admin_rating)
              : ""
          }
          onChangeText={(text) =>
            handleRestaurantInputChange("admin_rating", text)
          }
          placeholder={labels[language].adminRating || "Enter rating (0-5)"}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].notes || "Notes"}:</Text>
        <TextInput
          style={styles.input}
          value={newRestaurant.notes || ""}
          onChangeText={(text) => handleRestaurantInputChange("notes", text)}
          placeholder={labels[language].notes || "Enter notes"}
        />
      </View>
    </>
  );

  // Render doc post form
  const renderDocForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].text || "Text"}:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={newDocPost.text || ""}
          onChangeText={(text) => handleDocInputChange("text", text)}
          placeholder={labels[language].text || "Enter text"}
          multiline
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
        <Text style={styles.label}>{labels[language].videos || "Videos"}:</Text>
        <ScrollView horizontal style={{ flexDirection: "row", maxHeight: 100 }}>
          {selectedVideos.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={[styles.imagePreview, { marginLeft: 10 }]}
            />
          ))}
          <TouchableOpacity
            style={[
              styles.imageInput,
              { marginLeft: selectedVideos.length > 0 ? 10 : 0 },
            ]}
            onPress={pickVideo}
          >
            <Ionicons name="add" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );

  // Render general post form
  const renderGeneralForm = () => (
    <>
      <View style={styles.fieldRow}>
        <Text style={styles.label}>{labels[language].text || "Text"}:</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={newGeneralPost.text || ""}
          onChangeText={(text) => handleGeneralInputChange("text", text)}
          placeholder={labels[language].text || "Enter text"}
          multiline
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
        <Text style={styles.label}>{labels[language].videos || "Videos"}:</Text>
        <ScrollView horizontal style={{ flexDirection: "row", maxHeight: 100 }}>
          {selectedVideos.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={[styles.imagePreview, { marginLeft: 10 }]}
            />
          ))}
          <TouchableOpacity
            style={[
              styles.imageInput,
              { marginLeft: selectedVideos.length > 0 ? 10 : 0 },
            ]}
            onPress={pickVideo}
          >
            <Ionicons name="add" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </ScrollView>
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
                  ? labels[language].addCourse || "Add New Course"
                  : type === "restaurant"
                  ? labels[language].addRestaurant || "Add New Restaurant"
                  : type === "doc"
                  ? labels[language].addDocPost || "Add New Document Post"
                  : type === "general"
                  ? labels[language].addGeneralPost || "Add New General Post"
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
                ? renderCourseForm()
                : type === "restaurant"
                ? renderRestaurantForm()
                : type === "doc"
                ? renderDocForm()
                : type === "general"
                ? renderGeneralForm()
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
