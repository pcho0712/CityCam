import React, { useEffect, useState, useRef } from 'react';
import { Select, MenuItem } from '@mui/material';

interface CameraComponentProps {
  onCapture?: (dataUrl: string) => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ onCapture }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // カメラデバイスの取得
    const getDevices = async () => {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (!videoRef.current || !selectedDevice) return;

    const videoElement = videoRef.current;

    // 選択されたカメラで映像を取得
    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: selectedDevice },
        audio: false,
      })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch((e) => {
        console.log(e);
      });

    return () => {
      if (videoElement.srcObject) {
        let tracks = (videoElement.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [selectedDevice]);


  const captureScreenshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current?.videoWidth || 0;
    canvas.height = videoRef.current?.videoHeight || 0;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current as HTMLVideoElement, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    onCapture?.(dataUrl);
  };


  return (
    <div>
      {/* <h2>Live</h2> */}
      <video ref={videoRef} width="640" height="480"></video>
      <button onClick={captureScreenshot}>この街景色を記録する！</button>
      <Select
        value={selectedDevice || ""}
        onChange={(e) => setSelectedDevice(e.target.value as string)}
      >
        <MenuItem value="">
          <em>カメラを選択</em>
        </MenuItem>
        {devices.map(device => (
          <MenuItem key={device.deviceId} value={device.deviceId}>
            {device.label}
          </MenuItem>
        ))}
      </Select>
    </div>
    
    
  );
};

export default CameraComponent;
