import React, { useEffect, useState } from "react";
import { fetchParkingSpots } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BookingForm from "./BookingForm"; // Import the BookingForm component
import Konva from "konva";

const ParkingMap = ({ onSpotClick }) => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth * 0.9, // 90% of screen width
    height: window.innerHeight * 0.7, // 70% of screen height
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [selectedSpot, setSelectedSpot] = useState(null); // Selected parking spot
  const [parkingImage, setParkingImage] = useState(null); // Parking image state
  const [imageWidth, setImageWidth] = useState(0); // Image width
  const [imageHeight, setImageHeight] = useState(0); // Image height

  // Fetch parking spots from the API
  useEffect(() => {
    const loadSpots = async () => {
      try {
        const spots = await fetchParkingSpots();
        setParkingSpots(spots || []);
      } catch (error) {
        console.error("Error loading parking spots:", error);
        toast.error("Failed to load parking spots!");
      }
    };
    loadSpots();

    // Handle window resize
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.7,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load the parking map image and its dimensions
  useEffect(() => {
    const img = new window.Image();
    img.src = "/travel.png"; // Path to your parking map image
    img.onload = () => {
      setParkingImage(img);
      setImageWidth(img.width);
      setImageHeight(img.height);
    };
  }, []);

  // Dynamically adjust canvas size based on container resizing
  useEffect(() => {
    const container = document.getElementById("parking-map-container");
    const resizeObserver = new ResizeObserver(() => {
      setCanvasSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate spot width and height
  const spotWidth = imageWidth > 0 ? imageWidth / 10 : canvasSize.width / 19;
  const spotHeight = imageHeight > 0 ? imageHeight / 10 : canvasSize.height / 6;
  const laneWidth = canvasSize.width / 19;
  const cols = 9;

  // Handle spot click and open booking modal
  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    if (spot.is_occupied) {
      toast.error(`Spot ${spot.spot_number} is occupied!`);
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSpot(null);
  };

  // Render the parking map using Konva
  useEffect(() => {
    if (!parkingImage || parkingSpots.length === 0) return;

    const stage = new Konva.Stage({
      container: "parking-map-container",
      width: canvasSize.width,
      height: canvasSize.height,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    parkingSpots.forEach((spot, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = laneWidth + col * (spotWidth + laneWidth);
      const y = canvasSize.height * 0.15 + row * (spotHeight + laneWidth);

      // Render the parking spot images
      const image = new Konva.Image({
        x: x ,
        y: y * 1.5,
        width: spotWidth,
        height: spotHeight,
        image: parkingImage,
        opacity: spot.is_occupied ? 1 : 0, // Adjust opacity if occupied
      });

      image.on("click", () => handleSpotClick(spot));
      layer.add(image);

      // Render the parking spot number
      const text = new Konva.Text({
        x: x + spotWidth * 0.1,
        y: y,
        text: spot.spot_number,
        fontSize: Math.min(spotWidth, spotHeight) * 0.3,
        fontFamily: "Roboto",
        fill: "red",
        fontStyle: "bold",
      });

      layer.add(text);
    });

    // Draw horizontal dividers for rows
    const numRows = Math.ceil(parkingSpots.length / cols);
    for (let row = 1; row < numRows; row++) {
      const y = canvasSize.height * 0.14 + row * (spotHeight + laneWidth);
      const xStart = laneWidth;
      const xEnd = laneWidth + cols * (spotWidth + laneWidth);

      const line = new Konva.Line({
        points: [xStart, y, xEnd, y],
        stroke: "#bbb",
        strokeWidth: 2,
        dash: [5, 5],
      });

      layer.add(line);
    }

    // Draw vertical dividers for columns
    parkingSpots.forEach((_, index) => {
      const col = index % cols;
      const x = laneWidth + (col + 1) * (spotWidth + laneWidth);
      const yStart = canvasSize.height * 0.15;
      const yEnd = canvasSize.height * 0.15 + (Math.ceil(parkingSpots.length / cols) * (spotHeight + laneWidth));

      if (col !== cols - 1) {
        const line = new Konva.Line({
          points: [x, yStart, x, yEnd],
          stroke: "#bbb",
          strokeWidth: 2,
          dash: [5, 5],
        });
        layer.add(line);
      }
    });

    layer.batchDraw();

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
