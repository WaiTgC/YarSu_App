import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || "";

export const useGeneral = () => {
  const [generalPosts, setGeneralPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchGeneralPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/general-posts`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setGeneralPosts(data);
    } catch (error) {
      console.error("Error fetching general posts:", error);
    }
  }, []);

  const fetchGeneralPostDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/general-posts/${id}`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPost(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching general post details:", error);
    }
  }, []);

  const addGeneralPost = useCallback(async (postData) => {
    try {
      if (
        !postData.text &&
        (!postData.images || postData.images.length === 0) &&
        (!postData.videos || postData.videos.length === 0)
      ) {
        throw new Error(
          "At least one of text, images, or videos must be provided"
        );
      }
      const response = await fetch(`${API_URL}/general-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newPost = await response.json();
      setGeneralPosts((prevPosts) => [...prevPosts, newPost]);
      return newPost;
    } catch (error) {
      console.error("Error creating general post:", error);
      throw error;
    }
  }, []);

  const updateGeneralPost = useCallback(
    async (id, postData) => {
      try {
        if (
          !postData.text &&
          (!postData.images || postData.images.length === 0) &&
          (!postData.videos || postData.videos.length === 0)
        ) {
          throw new Error(
            "At least one of text, images, or videos must be provided"
          );
        }
        const response = await fetch(`${API_URL}/general-posts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
          body: JSON.stringify(postData),
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server response:", errorText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const updatedPost = await response.json();
        setGeneralPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === id ? updatedPost : post))
        );
        if (selectedPost?.id === id) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      } catch (error) {
        console.error("Error updating general post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const deleteGeneralPost = useCallback(
    async (id) => {
      try {
        const response = await fetch(`${API_URL}/general-posts/${id}`, {
          method: "DELETE",
          headers: {
            ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setGeneralPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== id)
        );
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting general post:", error);
        throw error;
      }
    },
    [selectedPost]
  );

  const handleMoreInfo = useCallback(
    (post) => {
      fetchGeneralPostDetails(post.id);
    },
    [fetchGeneralPostDetails]
  );

  const loadGeneralPosts = useCallback(async () => {
    await fetchGeneralPosts();
  }, [fetchGeneralPosts]);

  return {
    generalPosts,
    selectedPost,
    showDetails,
    fetchGeneralPosts,
    fetchGeneralPostDetails,
    addGeneralPost,
    updateGeneralPost,
    deleteGeneralPost,
    handleMoreInfo,
    loadGeneralPosts,
    setShowDetails,
  };
};
