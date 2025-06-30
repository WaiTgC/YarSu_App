import { useState, useCallback } from "react";

const API_URL = "https://yarsu-backend.onrender.com/api";

export const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/restaurants`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }, []);

  const loadRestaurants = useCallback(async () => {
    await fetchRestaurants();
  }, [fetchRestaurants]);

  return {
    restaurants,
    fetchRestaurants,
    loadRestaurants,
  };
};
