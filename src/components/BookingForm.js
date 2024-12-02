import React, { useState } from "react";
import Modal from "react-modal";
import { bookParkingSpot } from "../api";

// Menyeting elemen root untuk modal
Modal.setAppElement("#root");

const BookingForm = ({ selectedSpot, isOpen, closeModal }) => {
  const [formData, setFormData] = useState({
    name: "",
    carNumber: "",
    duration: "", // Durasi dalam bentuk string dari input
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Menghandle perubahan input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Menghandle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mendapatkan waktu mulai dan konversi durasi ke angka
    const startTime = new Date().toISOString();
    const durationInMinutes = Number(formData.duration);

    // Validasi durasi
    if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
      setMessage("Please enter a valid duration.");
      return;
    }

    setIsSubmitting(true); // Menandakan proses submit sedang berjalan

    const payload = {
      name: formData.name,
      car_number: formData.carNumber,
      spot_id: selectedSpot.id,
      start_time: startTime,
      duration: durationInMinutes,
    };

    try {
      const response = await bookParkingSpot(payload);

      if (response.success) {
        setMessage("Booking successful!");        
          window.location.reload(); // Refresh halaman setelah modal ditutup
       
      } else {
        setMessage("Failed to book the parking spot.");
      }
    } catch (error) {
      setMessage("Error booking the parking spot.");
    } finally {
      setIsSubmitting(false); // Reset status submit
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Booking Form"
      ariaHideApp={false}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "24px", margin: "0" }}>Book Spot: {selectedSpot.spotNumber}</h3>
        <button
          onClick={closeModal}
          style={{
            background: "transparent",
            border: "none",
            color: "#333",
            fontSize: "24px",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
        >
          X
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "2px solid #ddd",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        />
        <input
          type="text"
          name="carNumber"
          placeholder="Car Number"
          value={formData.carNumber}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "2px solid #ddd",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          value={formData.duration}
          onChange={handleChange}
          required
          style={{
            padding: "10px",
            border: "2px solid #ddd",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "10px",
            backgroundColor: "#6BCB77",
            border: "none",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px",
            transition: "background-color 0.3s ease",
          }}
        >
          {isSubmitting ? "Booking..." : "Book Now"}
        </button>
      </form>
      {message && (
        <p
          style={{
            color: "#FF6B6B",
            fontSize: "16px",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          {message}
        </p>
      )}
    </Modal>
  );
};

export default BookingForm;
