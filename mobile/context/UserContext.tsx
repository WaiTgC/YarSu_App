import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/libs/supabase";
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
  bannerImage1?: string; // Added for banner images
  bannerImage2?: string; // Added for banner images
  bannerImage3?: string; // Added for banner images
  bannerImage4?: string; // Added for banner images
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadImage: (file: any) => Promise<string | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    imageUrl: undefined,
    phoneNumber: "+1234567890",
    address: "123 Main St",
    email: undefined,
    telegram: "@johndoe",
    facebook: "john.doe",
    tiktok: "@johndoe",
    youtube: "UC123456789",
    bannerImage1: undefined,
    bannerImage2: undefined,
    bannerImage3: undefined,
    bannerImage4: undefined,
  });

  useEffect(() => {
    const loadProfile = async () => {
      const savedProfile = await AsyncStorage.getItem("userProfile");
      const savedImage = await AsyncStorage.getItem("userProfileImage");
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const nameFromEmail = session.user.email.split("@")[0];
          setProfile((prev) => ({
            ...prev,
            email: session.user.email,
            name: nameFromEmail,
          }));
        }
      }
      if (savedImage && !profile.imageUrl) {
        setProfile((prev) => ({ ...prev, imageUrl: savedImage }));
      }
    };
    loadProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    await AsyncStorage.setItem("userProfile", JSON.stringify(newProfile));
  };

  const uploadImage = async (file: any) => {
    try {
      const fileExt = file.uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
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
