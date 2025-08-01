import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/libs/supabase";

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
    const fetchUserEmail = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setProfile((prev) => ({ ...prev, email: session.user.email }));
      }
    };
    fetchUserEmail();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
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
