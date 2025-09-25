import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import socket from '../services/socket';
import { useChatAppStore } from '../stores/countStateStore';
import { useRoomStore } from '../stores/roomStore';

const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const { getRoomClicked } = useChatAppStore();
  const roomId = getRoomClicked();
  const { setMembers } = useRoomStore();

  useEffect(() => {
    const startCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(localStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
          socket.emit('join-room', { roomId, peerId: id });
        });

        peer.on('call', (call) => {
          call.answer(localStream);
          call.on('stream', (remoteStream) => {
            if (!remoteVideoRefs.current.has(call.peer)) {
              const videoElement = createVideoElement(remoteStream);
              document.getElementById('remote-videos')?.appendChild(videoElement);
              remoteVideoRefs.current.set(call.peer, videoElement);
            }
          });
        });

        socket.on('user-joined', ({ peerId, roomId: joinedRoomId }) => {
          if (localStream && roomId === joinedRoomId && !remoteVideoRefs.current.has(peerId)) {
            const call = peer.call(peerId, localStream);
            call.on('stream', (remoteStream) => {
              if (!remoteVideoRefs.current.has(peerId)) {
                const videoElement = createVideoElement(remoteStream);
                document.getElementById('remote-videos')?.appendChild(videoElement);
                remoteVideoRefs.current.set(peerId, videoElement);
              }
            });
          }
        });

        socket.on('user-left', ({ peerId, roomId: leftRoomId }) => {
          if (roomId === leftRoomId) {
            const videoElement = remoteVideoRefs.current.get(peerId);
            if (videoElement) {
              videoElement.srcObject = null;
              remoteVideoRefs.current.delete(peerId);
              videoElement.remove();
            }
          }
        });

      } catch (error) {
        alert('Không thể truy cập camera và micro.');
      }
    };

    const createVideoElement = (stream: MediaStream) => {
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.autoplay = true;
      videoElement.className = 'w-1/2 h-auto border border-gray-300';
      return videoElement;
    };

    startCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socket.emit('leave-room', { roomId });
    };
  }, [roomId]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].stop();
    }
    window.close();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-row gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 h-auto border border-gray-300" />
        <div id="remote-videos" className="flex flex-row gap-4"></div>
      </div>
      <button
        onClick={handleEndCall}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        Kết thúc cuộc gọi
      </button>
    </div>
  );
};

export default VideoCall;
