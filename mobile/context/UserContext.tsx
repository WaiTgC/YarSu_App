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
        // Fetch email from Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setProfile((prev) => ({ ...prev, email: session.user.email }));
        }

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

        // Fetch profile from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("name, phone_number, address, image_url")
          .eq("email", session?.user?.email)
          .single();
        if (error) throw error;
        if (data) {
          setProfile((prev) => ({
            ...prev,
            name: data.name || "",
            phoneNumber: data.phone_number || "",
            address: data.address || "",
            imageUrl: data.image_url || prev.imageUrl,
          }));
        }
      } catch (error) {
        console.error("UserContext - Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setProfile((prev) => ({ ...prev, ...updates }));
      // Persist to AsyncStorage
      await AsyncStorage.setItem(
        "userProfile",
        JSON.stringify({ ...profile, ...updates })
      );
      // Persist to Supabase
      if (profile.email) {
        const { error } = await supabase
          .from("users")
          .update({
            name: updates.name || profile.name,
            phone_number: updates.phoneNumber || profile.phoneNumber,
            address: updates.address || profile.address,
            image_url: updates.imageUrl || profile.imageUrl,
          })
          .eq("email", profile.email);
        if (error) throw error;
      }
    } catch (error) {
      console.error("UserContext - Error updating profile:", error);
    }
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
      await updateProfile({ imageUrl: data.publicUrl });
      await AsyncStorage.setItem("userProfileImage", data.publicUrl);
      return data.publicUrl;
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
