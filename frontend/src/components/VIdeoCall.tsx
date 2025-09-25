import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Peer from 'peerjs';
import socket from '../services/socket';
import { Box, Paper, Stack, Typography, IconButton, Tooltip, Button, Divider, Alert } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import GroupIcon from '@mui/icons-material/Group';
import { useUserStore } from '../stores/userStore';

const VideoCall: React.FC = () => {
  const [searchParams] = useSearchParams();
  const videoRoomId = searchParams.get('roomId');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const user = useUserStore((s) => s.userData);

  useEffect(() => {
    const startCall = async () => {
      try {
        // Validation checks
        if (!videoRoomId) {
          setError('Không tìm thấy phòng gọi video.');
          return;
        }

        const allowed = await new Promise<boolean>((resolve) => {
          socket.emit('join-video-call', { 
            roomId: videoRoomId, 
            peerId: 'temp-peer-id' // Will be updated when peer is created
          });
          
          const ok = (data: any) => { 
            setIsConnected(true);
            setError('');
            resolve(true); 
            cleanup(); 
          };
          const err = (msg: string) => { 
            setError(msg || 'Không thể tham gia cuộc gọi'); 
            resolve(false); 
            cleanup(); 
          };
          const cleanup = () => {
            socket.off('video-call-success', ok);
            socket.off('video-call-error', err);
          };
          socket.on('video-call-success', ok);
          socket.on('video-call-error', err);
          setTimeout(() => { cleanup(); resolve(false); }, 5000);
        });
        
        if (!allowed) return;

        const local = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(local);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = local;
        }

        const peer = new Peer();
        peerRef.current = peer;

        peer.on('open', (id) => {
          // Update the peer ID in the video call room
          socket.emit('join-video-call', { 
            roomId: videoRoomId, 
            peerId: id 
          });
        });

        peer.on('call', (call) => {
          call.answer(local);
          call.on('stream', (remoteStream) => {
            if (!remoteVideoRefs.current.has(call.peer)) {
              const videoElement = createVideoElement(remoteStream);
              document.getElementById('remote-videos')?.appendChild(videoElement);
              remoteVideoRefs.current.set(call.peer, videoElement);
            }
          });
        });

        socket.on('user-joined-video-call', ({ peerId, roomId: joinedRoomId }) => {
          if (local && videoRoomId === joinedRoomId && !remoteVideoRefs.current.has(peerId)) {
            const call = peer.call(peerId, local);
            call.on('stream', (remoteStream) => {
              if (!remoteVideoRefs.current.has(peerId)) {
                const videoElement = createVideoElement(remoteStream);
                document.getElementById('remote-videos')?.appendChild(videoElement);
                remoteVideoRefs.current.set(peerId, videoElement);
              }
            });
          }
        });

        socket.on('user-left-video-call', ({ peerId, roomId: leftRoomId }) => {
          if (videoRoomId === leftRoomId) {
            const videoElement = remoteVideoRefs.current.get(peerId);
            if (videoElement) {
              videoElement.srcObject = null;
              remoteVideoRefs.current.delete(peerId);
              videoElement.remove();
            }
          }
        });

        socket.on('video-call-ended', ({ from }) => {
          if (from !== user?.id) {
            setError('Cuộc gọi đã được kết thúc bởi người gọi.');
            setTimeout(() => window.history.back(), 2000);
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
      if (isConnected && videoRoomId) {
        socket.emit('leave-video-call', { roomId: videoRoomId });
      }
    };
  }, [videoRoomId, user?.id]);

  const toggleVideo = () => {
    if (!localStream) return;
    const tracks = localStream.getVideoTracks();
    if (tracks[0]) {
      tracks[0].enabled = !tracks[0].enabled;
      setVideoEnabled(tracks[0].enabled);
    }
  };

  const toggleAudio = () => {
    if (!localStream) return;
    const tracks = localStream.getAudioTracks();
    if (tracks[0]) {
      tracks[0].enabled = !tracks[0].enabled;
      setAudioEnabled(tracks[0].enabled);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      setScreenSharing(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
    } catch (_) {
      // cancelled
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenSharing(false);
      if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }
  };

  const handleEndCall = () => {
    stopScreenShare();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (isConnected && videoRoomId) {
      socket.emit('end-video-call', { roomId: videoRoomId });
    }
    window.history.back();
  };

  // Show error if any validation fails
  if (error) {
    return (
      <Box sx={{ height: '100vh', bgcolor: 'background.default', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Lỗi Video Call</Typography>
          <Typography>{error}</Typography>
          <Button onClick={() => window.history.back()} sx={{ mt: 2 }}>
            Quay lại
          </Button>
        </Alert>
      </Box>
    );
  }

  // Show loading state while connecting
  if (!isConnected) {
    return (
      <Box sx={{ height: '100vh', bgcolor: 'background.default', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Đang kết nối...</Typography>
          <Typography>Đang thiết lập cuộc gọi video với bạn bè.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Stack direction="row" spacing={2} sx={{ height: '80%' }}>
        <Paper variant="outlined" sx={{ flex: 1, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </Paper>
        <Paper variant="outlined" sx={{ flex: 1, p: 1, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}><GroupIcon fontSize="small" sx={{ mr: 1 }} />Người tham gia</Typography>
          <Box id="remote-videos" />
        </Paper>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={2} justifyContent="center">
        <Tooltip title={videoEnabled ? 'Tắt camera' : 'Bật camera'}>
          <IconButton color={videoEnabled ? 'primary' : 'default'} onClick={toggleVideo}>
            {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={audioEnabled ? 'Tắt mic' : 'Bật mic'}>
          <IconButton color={audioEnabled ? 'primary' : 'default'} onClick={toggleAudio}>
            {audioEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        {!screenSharing ? (
          <Tooltip title="Chia sẻ màn hình">
            <IconButton color="primary" onClick={startScreenShare}>
              <ScreenShareIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Dừng chia sẻ màn hình">
            <IconButton color="warning" onClick={stopScreenShare}>
              <StopScreenShareIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Kết thúc cuộc gọi">
          <IconButton color="error" onClick={handleEndCall}>
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default VideoCall;
