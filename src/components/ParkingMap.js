import React, { useEffect, useState } from "react";
import { fetchParkingSpots } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingForm from "./BookingForm"; // Import the BookingForm component
import Konva from "konva";

const ParkingMap = ({ onSpotClick }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth * 0.9, // 90% dari lebar layar
    height: window.innerHeight * 0.7, // 70% dari tinggi layar
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const [selectedSpot, setSelectedSpot] = useState(null); // Track selected spot

  const [parkingImage, setParkingImage] = useState(null);

  // Define image size properties
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Load parking spots from the API
  useEffect(() => {
    const loadSpots = async () => {
      try {
        const spots = await fetchParkingSpots();
        setParkingSpots(spots || []); // Ensure the array is not empty
      } catch (error) {
        console.error("Error loading parking spots:", error);
        toast.error("Failed to load parking spots!");
      }
    };
    loadSpots();

    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth * 1.9,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load the parking image and its dimensions
  useEffect(() => {
    const img = new window.Image();
    img.src = "/travel.png"; // Update with the path to your image
    img.onload = () => {
      setParkingImage(img);
      setImageWidth(img.width); // Dynamically set imageWidth
      setImageHeight(img.height); // Dynamically set imageHeight
    };
  }, []);
  useEffect(() => {
    const container = document.getElementById("parking-map-container");
  
    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    });
  
    resizeObserver.observe(container);
  
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // Spot width and height based on canvas size and image size
  const spotWidth = imageWidth > 0 ? imageWidth / 10 : canvasSize.width / 19;
  const spotHeight = imageHeight > 0 ? imageHeight / 10 : canvasSize.height / 6;
  const laneWidth = canvasSize.width / 19;
  const cols = 9;

  // Handle spot click to either show modal or display a message if occupied
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    if (spot.is_occupied) {
      toast.error(`Spot ${spot.spot_number} is occupied!`);
    } else {
      setIsModalOpen(true); // Open modal if the spot is available
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedSpot(null); // Clear selected spot
  };

  // Draw the parking map using Konva
  useEffect(() => {
    if (!parkingImage || parkingSpots.length === 0) return; // Wait for image and spots to load

    const stage = new Konva.Stage({
      container: "parking-map-container",
      width: canvasSize.width,
      height: canvasSize.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    // Redraw parking spots when canvas size or parking spots change
    parkingSpots.forEach((spot, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = laneWidth + col * (spotWidth + laneWidth);
      const y = canvasSize.height * 0.15 + row * (spotHeight + laneWidth);

      if (parkingImage) {
        const image = new Konva.Image({
          x: x * 1.2,
          y: y * 1.5, // Slightly adjust y for better positioning
          width: spotWidth ,
          height: spotHeight ,
          image: parkingImage,
          opacity: spot.is_occupied ? 3 : 0, // Adjust opacity if occupied
        });

        image.on("click", () => handleSpotClick(spot));
        layer.add(image);
      }

      const text = new Konva.Text({
        x: x + spotWidth * 0.1,
        y: y,
        text: spot.spot_number,
        fontSize: Math.min(spotWidth, spotHeight) * 0.3,
        fontFamily: "roboto",
        fill: "red",
        fontStyle: "bold",
      });

      layer.add(text);
    });

    // Draw horizontal dividers dynamically based on the actual number of rows
    const numRows = Math.ceil(parkingSpots.length / cols); // Total rows based on parking spots and columns
    for (let row = 1; row < numRows; row++) { // Start from row 1 to skip the top
      const y = canvasSize.height * 0.14 + row * (spotHeight + laneWidth); // Calculate y dynamically for each row
      const xStart = laneWidth; // Start position of the line
      const xEnd = laneWidth + cols * (spotWidth + laneWidth); // End position of the line

      const line = new Konva.Line({
        points: [xStart, y, xEnd, y], // Line from xStart to xEnd at height y
        stroke: "#bbb",
        strokeWidth: 2,
        dash: [5, 5], // Dashed style
      });

      layer.add(line); // Add line to the layer
    }


    // Draw vertical dividers
    parkingSpots.forEach((_, index) => {
      const col = index % cols;
      const x = laneWidth + (col + 1) * (spotWidth + laneWidth);
      const yStart = canvasSize.height * 0.15;
      const yEnd = canvasSize.height * 0.15 + (Math.ceil(parkingSpots.length / cols) * (spotHeight + laneWidth));

      if (col !== cols - 1) { // Skip last column to avoid adding a line at the far right
        const line = new Konva.Line({
          points: [x, yStart, x, yEnd],
          stroke: "#bbb",
          strokeWidth: 2,
          dash: [5, 5], // Dashed line style
        });
        layer.add(line);
      }
    });

    layer.batchDraw();

    // Cleanup Konva when component unmounts
    return () => {
      stage.destroy();
    };
  }, [parkingSpots, parkingImage, canvasSize, laneWidth, spotHeight, spotWidth]);

  return (
    <>
      <div id="parking-map-container" />
  
      <ToastContainer
        position="top-center"
        autoClose={500}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
  
      {/* Modal booking */}
      {selectedSpot && (
        <BookingForm
          selectedSpot={selectedSpot}
          isOpen={isModalOpen}
          closeModal={closeModal}
        />
      )}
    </>
  );
  
};

export default ParkingMap;
