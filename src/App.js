// src/App.js
import React, { useState } from "react";
import ParkingMap from "./components/ParkingMap";
import BookingForm from "./components/BookingForm";
import ReservationDetails from "./components/ReservationDetails";
import "./styles/App.css";

function App() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  return (
    <div className="App">
      <h3>Parking Area</h3>
      <ParkingMap onSpotClick={setSelectedSpot} />
      {selectedSpot && <BookingForm selectedSpot={selectedSpot} />}
      <ReservationDetails />
    </div>
  );
}

export default App;
