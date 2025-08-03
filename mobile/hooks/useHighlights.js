import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useHighlights = () => {
  const [highlights, setHighlights] = useState([]);
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchHighlights = useCallback(async () => {
    console.log(`Fetching highlights from: ${API_URL}/highlights`);
    try {
      const response = await fetch(`${API_URL}/highlights`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Highlights data:", data);
      setHighlights(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching highlights:", error.message);
      } else {
        console.error("Error fetching highlights:", error);
      }
    }
  }, []);

  const fetchHighlightById = useCallback(async (id) => {
    console.log("Fetching highlight by ID:", id);
    try {
      const response = await fetch(`${API_URL}/highlights/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Highlight data:", data);
      setSelectedHighlight(data);
      setShowDetails(true);
      return data;
    } catch (error) {
      console.error("Error fetching highlight:", error);
      throw error;
    }
  }, []);

  const createHighlight = useCallback(async (highlightData) => {
    console.log("Creating highlight:", highlightData);
    try {
      const response = await fetch(`${API_URL}/highlights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(highlightData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const newHighlight = await response.json();
      setHighlights((prev) => [...prev, newHighlight]);
      return newHighlight;
    } catch (error) {
      console.error("Error creating highlight:", error);
      throw error;
    }
  }, []);

  const updateHighlight = useCallback(async (id, highlightData) => {
    console.log("Updating highlight:", id, highlightData);
    try {
      const response = await fetch(`${API_URL}/highlights/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(highlightData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const updatedHighlight = await response.json();
      setHighlights((prev) =>
        prev.map((highlight) =>
          highlight.id === id ? updatedHighlight : highlight
        )
      );
      return updatedHighlight;
    } catch (error) {
      console.error("Error updating highlight:", error);
      throw error;
    }
  }, []);

  const deleteHighlight = useCallback(async (id) => {
    console.log("Deleting highlight:", id);
    try {
      const response = await fetch(`${API_URL}/highlights/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      setHighlights((prev) => prev.filter((highlight) => highlight.id !== id));
    } catch (error) {
      console.error("Error deleting highlight:", error);
      throw error;
    }
  }, []);

  const handleMoreInfo = useCallback((highlight) => {
    console.log("Showing details for highlight:", highlight.id);
    setSelectedHighlight(highlight);
    setShowDetails(true);
  }, []);

  const loadHighlights = useCallback(async () => {
    console.log("Loading highlights");
    await fetchHighlights();
  }, [fetchHighlights]);

  return {
    highlights,
    selectedHighlight,
    showDetails,
    fetchHighlights,
    fetchHighlightById,
    createHighlight,
    updateHighlight,
    deleteHighlight,
    handleMoreInfo,
    loadHighlights,
    setShowDetails,
  };
};
