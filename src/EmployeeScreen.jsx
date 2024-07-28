import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://192.168.41.1:5000'); // Your Node.js server URL

const EmployeeScreen = () => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();

    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };

    // Check for getDisplayMedia support
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        })
        .catch(error => {
          console.error('Error accessing display media:', error);
          setIsSupported(false);
        });
    } else {
      console.error('getDisplayMedia is not supported in this browser.');
      setIsSupported(false);
    }

    return () => {
      peerConnection.close();
    };
  }, []);

  return (
    <div>
      {isSupported ? (
        <div>Employee Screen Sharing...</div>
      ) : (
        <div>Your browser does not support screen sharing. Please update your browser or use a supported one.</div>
      )}
    </div>
  );
};

export default EmployeeScreen;
