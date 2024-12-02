// src/api.js
import axios from "axios";

// Base URL untuk API backend
const API_URL = "http://localhost:8080";

// Fetch data tempat parkir dari API backend
export const fetchParkingSpots = async () => {
  try {
    const response = await axios.get(`${API_URL}/parking-spots`);
    return response.data;
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    throw error;
  }
};

// Memesan tempat parkir melalui API backend
export const bookParkingSpot = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/book-spot`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error booking parking spot:", error);
    throw error;
  }
};

// Mengambil data reservasi dari API backend
export const fetchReservations = async () => {
  try {
    const response = await axios.get(`${API_URL}/reservations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservations:", error);
    throw error;
  }
};
