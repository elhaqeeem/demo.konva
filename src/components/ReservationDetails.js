import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import { fetchReservations, fetchParkingSpots } from "../api"; // Tambahkan fetchParkingSpots
import { format } from "date-fns";

const ReservationDetails = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        // Ambil data reservations dan parking spots secara paralel
        const [reservationsData, parkingSpotsData] = await Promise.all([
          fetchReservations(),
          fetchParkingSpots(),
        ]);

        // Mapping reservations dengan spot_number
        const updatedReservations = reservationsData.map((reservation) => {
          const spot = parkingSpotsData.find(
            (spot) => spot.id === reservation.spot_id
          );
          return {
            ...reservation,
            spot_number: spot ? spot.spot_number : "Unknown", // Gunakan spot_number jika ditemukan
          };
        });

        setReservations(updatedReservations); // Set data yang sudah diperbarui
      } catch (error) {
        console.error("Error loading reservations or parking spots:", error);
      } finally {
        setLoading(false); // Set loading selesai
      }
    };

    loadReservations();
  }, []);

  // Definisi kolom untuk datatable
  const columns = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Spot Number",
        selector: (row) => row.spot_number, // Gunakan spot_number
        sortable: true,
      },
      {
        name: "Duration (minutes)",
        selector: (row) => row.duration,
        sortable: true,
      },
      {
        name: "Start Time",
        selector: (row) =>
          row.start_time ? format(new Date(row.start_time), "Pp") : "N/A",
        sortable: true,
      },
    ],
    [] // Kolom hanya didefinisikan sekali
  );

  return (
    <div>
      <h3>Reservation Details</h3>
      <DataTable
        columns={columns}
        data={reservations}
        progressPending={loading}
        progressComponent={<div>Loading reservations...</div>}
        pagination
        highlightOnHover
        striped
        responsive
        persistTableHead
      />
    </div>
  );
};

export default ReservationDetails;
