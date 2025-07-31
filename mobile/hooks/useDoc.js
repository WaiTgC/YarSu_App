import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";
const AUTH_TOKEN = process.env.REACT_APP_API_TOKEN || "";

export const useDoc = () => {
  const [docPosts, setDocPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchDocPosts = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/docs`, {
        headers: {
          ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setDocPosts(data);
    } catch (error) {
      console.error("Error fetching doc posts:", error);
    }
  }, []);

  const fetchDocPostDetails = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/docs/${id}`, {
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
      console.error("Error fetching doc post details:", error);
    }
  }, []);

  const addDocPost = useCallback(async (postData, files) => {
    try {
      const formData = new FormData();
      if (postData.text) {
        formData.append("text", postData.text);
      }
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("media", file);
        });
      }
      if (!postData.text && (!files || files.length === 0)) {
        throw new Error("At least one of text or media must be provided");
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
      setDocPosts((prevPosts) => [...prevPosts, newPost]);
      return newPost;
    } catch (error) {
      console.error("Error creating doc post:", error);
      throw error;
    }
  }, []);

  const updateDocPost = useCallback(
    async (id, postData, files) => {
      try {
        const formData = new FormData();
        if (postData.text) {
          formData.append("text", postData.text);
        }
        if (files && files.length > 0) {
          files.forEach((file) => {
            formData.append("media", file);
          });
        }
        if (!postData.text && (!files || files.length === 0)) {
          throw new Error("At least one of text or media must be provided");
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
        setDocPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === id ? updatedPost : post))
        );
        if (selectedPost?.id === id) {
          setSelectedPost(updatedPost);
        }
        return updatedPost;
      } catch (error) {
        console.error("Error updating doc post:", error);
        throw error;
      }
    },
    [selectedPost]
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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setDocPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== id)
        );
        if (selectedPost?.id === id) {
          setSelectedPost(null);
          setShowDetails(false);
        }
      } catch (error) {
        console.error("Error deleting doc post:", error);
        throw error;
      }
    },
    [selectedPost]
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
    showDetails,
    fetchDocPosts,
    fetchDocPostDetails,
    addDocPost,
    updateDocPost,
    deleteDocPost,
    handleMoreInfo,
    loadDocPosts,
    setShowDetails,
  };
};