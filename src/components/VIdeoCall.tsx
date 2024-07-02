import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../services/socket';
import { useChatAppStore } from '../stores/countStateStore';
import { useRoomStore, Member } from '../stores/roomStore';

const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const { getRoomClicked } = useChatAppStore();
  const roomId = getRoomClicked();
  const navigate = useNavigate();
  const { members, setMembers } = useRoomStore();

  useEffect(() => {
    const startCall = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(localStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        socket.emit('join-room', { roomId });

        socket.on('all-members', (members: Member[]) => {
          setMembers(members);
          members.forEach((member) => {
            if (member._id !== socket.id) {
              createPeerConnection(member._id, localStream);
            }
          });
        });

        socket.on('offer', async ({ from, offer }) => {
          const peerConnection = createPeerConnection(from, localStream);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
          socket.emit('answer', { roomId, to: from, answer });
        });

        socket.on('answer', async ({ from, answer }) => {
          const peerConnection = peerConnectionsRef.current.get(from);
          if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on('ice-candidate', async ({ from, candidate }) => {
          const peerConnection = peerConnectionsRef.current.get(from);
          if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on('user-joined', (member: Member) => {
          if (member._id !== socket.id) {
            const peerConnection = createPeerConnection(member._id, localStream);
            createOffer(peerConnection, member._id);
          }
        });

        socket.on('user-left', (id: string) => {
          const peerConnection = peerConnectionsRef.current.get(id);
          if (peerConnection) {
            peerConnection.close();
            peerConnectionsRef.current.delete(id);
          }
        });

      } catch (error) {
        alert('Failed to access camera and microphone.');
      }
    };

    const createPeerConnection = (id: string, localStream: MediaStream) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],
      });

      peerConnectionsRef.current.set(id, peerConnection);

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { roomId, to: id, candidate: event.candidate });
        }
      };

      peerConnection.ontrack = (event) => {
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        setMembers((prevMembers) => {
          return prevMembers.map((member) => {
            if (member._id === id && remoteVideoRefs.current.has(id)) {
              remoteVideoRefs.current.get(id)!.srcObject = remoteStream;
            }
            return member;
          });
        });
      };

      return peerConnection;
    };

    const createOffer = async (peerConnection: RTCPeerConnection, id: string) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
      socket.emit('offer', { roomId, to: id, offer });
    };

    startCall();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      peerConnectionsRef.current.forEach((peerConnection) => {
        peerConnection.close();
      });
      peerConnectionsRef.current.clear();
      socket.emit('leave-room', { roomId });
    };
  }, [roomId, setMembers]);

  const handleEndCall = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].stop();
    }
   window.close()
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-row gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 h-auto border border-gray-300" />
        {members.map((member) => (
          <video
            key={member._id}
            ref={(el) => remoteVideoRefs.current.set(member._id, el)}
            autoPlay
            className="w-1/2 h-auto border border-gray-300"
          />
        ))}
      </div>
      <button
        onClick={handleEndCall}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCall;
