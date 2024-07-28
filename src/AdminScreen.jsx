// src/AdminScreen.js
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://192.168.41.1:5000'); // Your Node.js server URL

const AdminScreen = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection();

    socket.on('offer', async (offer) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit('answer', answer);
    });

    socket.on('answer', (answer) => {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', (candidate) => {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      peerConnection.close();
    };
  }, []);

  return (
    <div>
      <h1>Admin Screen</h1>
      <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};

export default AdminScreen;
