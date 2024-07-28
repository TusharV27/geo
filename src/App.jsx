// src/GeofenceNotifier.js
import React, { useEffect, useState } from 'react';

const App = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  // Define the geofence area with your home's coordinates and radius
  const geofence = {
    latitude: 21.22170186089608,  // Replace with your home's latitude
    longitude: 72.83280255459941, // Replace with your home's longitude
    radius: 100  // Radius in meters
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });

        const distance = calculateDistance(
          latitude,
          longitude,
          geofence.latitude,
          geofence.longitude
        );

        if (distance <= geofence.radius) {
          showNotification('You are inside your home area!');
        } else {
          showNotification('You are outside your home area!');
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const showNotification = (message) => {
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(message);
        }
      });
    }
  };

  return (
    <div>
      <h1>Geofence Notifier</h1>
      {position && (
        <p>
          Current Position: Latitude {position.latitude}, Longitude {position.longitude}
        </p>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default App;
