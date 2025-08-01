import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import { labels } from "@/libs/language";

const API_URL = "https://yarsu-backend.onrender.com/api";
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || "";

export const useDoc = () => {
  const { language } = useLanguage();
  const [docPosts, setDocPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDocs, setShowDocs] = useState(false);

  const fetchDocPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/docs`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Map media to images for frontend consistency
      const mappedData = data.map((post) => ({
        ...post,
        images: post.media || [],
        videos: [],
      }));
      setDocPosts(mappedData);
    } catch (error) {
      console.error("Error fetching doc posts:", error);
      Alert.alert(
        labels[language].error || "Error",
        labels[language].fetchFailed || "Failed to fetch document posts"
      );
    }
  }, [language]);

  const fetchDocPostDetails = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/docs/${id}`, {
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Map media to images for frontend consistency
        const mappedData = {
          ...data,
          images: data.media || [],
          videos: [],
        };
        setSelectedPost(mappedData);
        setShowDocs(true);
      } catch (error) {
        console.error("Error fetching doc post details:", error);
        Alert.alert(
          labels[language].error || "Error",
          labels[language].fetchFailed ||
            "Failed to fetch document post details"
        );
      }
    },
    [language]
  );

  const addDocPost = useCallback(
    async (postData) => {
      try {
        const formData = new FormData();
        formData.append("text", postData.text || "");

        if (postData.images && postData.images.length > 0) {
          postData.images.forEach((base64, index) => {
            const byteString = atob(base64.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/jpeg" });
            const file = new File([blob], `image_${Date.now()}_${index}.jpg`, {
              type: "image/jpeg",
            });
            formData.append("media[]", file);
          });
        }

        if (postData.videos && postData.videos.length > 0) {
          postData.videos.forEach((video, index) => {
            const byteString = atob(video.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "video/mp4" });
            const file = new File([blob], `video_${Date.now()}_${index}.mp4`, {
              type: "video/mp4",
            });
            formData.append("media[]", file);
          });
        }

        const response = await fetch(`${API_URL}/docs`, {
          method: "POST",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const newPost = await response.json();
        const mappedPost = {
          ...newPost,
          images: newPost.media || [],
          videos: [],
        };
        setDocPosts((prevPosts) => [mappedPost, ...prevPosts]);
        return mappedPost;
      } catch (error) {
        console.error("Error creating doc post:", error);
        Alert.alert(
          labels[language].error || "Error",
          labels[language].addFailed || "Failed to add document post"
        );
        throw error;
      }
    },
    [language]
  );

  const updateDocPost = useCallback(
    async (id, postData) => {
      try {
        const formData = new FormData();
        formData.append("text", postData.text || "");

        if (postData.images && postData.images.length > 0) {
          postData.images.forEach((base64, index) => {
            const byteString = atob(base64.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/jpeg" });
            const file = new File([blob], `image_${Date.now()}_${index}.jpg`, {
              type: "image/jpeg",
            });
            formData.append("media[]", file);
          });
        }

        if (postData.videos && postData.videos.length > 0) {
          postData.videos.forEach((video, index) => {
            const byteString = atob(video.split(",")[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "video/mp4" });
            const file = new File([blob], `video_${Date.now()}_${index}.mp4`, {
              type: "video/mp4",
            });
            formData.append("media[]", file);
          });
        }

        const response = await fetch(`${API_URL}/docs/${id}`, {
          method: "PUT",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const updatedPost = await response.json();
        const mappedPost = {
          ...updatedPost,
          images: updatedPost.media || [],
          videos: [],
        };
        setDocPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === id ? mappedPost : post))
        );
        if (selectedPost?.id === id) {
          setSelectedPost(mappedPost);
        }
        return mappedPost;
      } catch (error) {
        console.error("Error updating doc post:", error);
        Alert.alert(
          labels[language].error || "Error",
          labels[language].saveFailed || "Failed to save document post"
        );
        throw error;
      }
    },
    [language, selectedPost]
  );

  const deleteDocPost = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/docs/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setDocPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setShowDocs(false);
        }
      } catch (error) {
        console.error("Error deleting doc post:", error);
        Alert.alert(
          labels[language].error || "Error",
          labels[language].deleteFailed || "Failed to delete document post"
        );
        throw error;
      }
    },
    [language, selectedPost]
  );

  const handleMoreInfo = useCallback(
    (post) => {
      fetchDocPostDetails(post.id);
    },
    [fetchDocPostDetails]
  );

  const loadDocPosts = useCallback(async () => {
    await fetchDocPosts();
  }, [fetchDocPosts]);

  return {
    docPosts,
    selectedPost,
    showDocs,
    fetchDocPosts,
    fetchDocPostDetails,
    addDocPost,
    updateDocPost,
    deleteDocPost,
    handleMoreInfo,
    loadDocPosts,
    setShowDocs,
  };
};
