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
  bannerImage1?: string | null;
  bannerImage2?: string | null;
  bannerImage3?: string | null;
  bannerImage4?: string | null;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    imageUrl: undefined,
    phoneNumber: "+1234567890",
    address: "123 Main St",
    email: "john@example.com",
    telegram: "@johndoe",
    facebook: "john.doe",
    tiktok: "@johndoe",
    youtube: "UC123456789",
    bannerImage1: null,
    bannerImage2: null,
    bannerImage3: null,
    bannerImage4: null,
  });

  // Load profile from AsyncStorage on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem("userProfile");
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile((prev) => ({ ...prev, ...parsedProfile }));
          console.log(
            "UserContext - Loaded profile from AsyncStorage:",
            parsedProfile
          );
        }
      } catch (error) {
        console.error(
          "UserContext - Error loading profile from AsyncStorage:",
          error
        );
      }
    };
    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const newProfile = { ...profile, ...updates };
      setProfile(newProfile);
      await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
      console.log("UserContext - Profile saved to AsyncStorage:", newProfile);
    } catch (error) {
      console.error("UserContext - Error updating profile:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
