import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  name: string;
  imageUrl?: string;
  phoneNumber?: string;
  address?: string;
  email?: string;
  telegram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadImage: (file: any) => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    imageUrl: undefined,
    phoneNumber: "",
    address: "",
    email: "",
    telegram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Load profile from AsyncStorage
        const storedProfile = await AsyncStorage.getItem("userProfile");
        const storedImage = await AsyncStorage.getItem("userProfileImage");
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile((prev) => ({ ...prev, ...parsedProfile }));
        }
        if (storedImage) {
          setProfile((prev) => ({ ...prev, imageUrl: storedImage }));
        }
      } catch (error) {
        console.error("UserContext - Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      // Persist to AsyncStorage
      await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
    } catch (error) {
      console.error("UserContext - Error updating profile:", error);
    }
  };

  const uploadImage = async (file: any) => {
    try {
      // Store the image URI directly in AsyncStorage (or convert to base64 if needed)
      const imageUri = file.uri;
      await AsyncStorage.setItem("userProfileImage", imageUri);
      await updateProfile({ imageUrl: imageUri });
      return imageUri;
    } catch (error) {
      console.error("UserContext - Error uploading image:", error);
      return null;
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, uploadImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
