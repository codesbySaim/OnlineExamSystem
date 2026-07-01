import React, { useRef, useEffect, useState } from 'react';
import { proctoringAPI } from '../services/api';

interface Props {
  sessionId: number;
}

const ProctoringMonitor: React.FC<Props> = ({ sessionId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    startCamera();
    setupTabSwitchDetection();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      logViolation('CameraAccessDenied', 'High');
      addViolation('⚠️ Camera access denied!');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const setupTabSwitchDetection = () => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setTabSwitchCount((prev) => prev + 1);
      logViolation('TabSwitch', 'Medium');
      addViolation('⚠️ Tab switch detected!');
    }
  };

  const logViolation = async (eventType: string, severity: string) => {
    try {
      await proctoringAPI.logViolation({
        sessionId,
        eventType,
        severity,
      });
    } catch (error) {
      console.error('Failed to log violation');
    }
  };

  const addViolation = (message: string) => {
    setViolations((prev) => [...prev.slice(-4), message]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-[#0a0f1e] border-2 border-blue-500/30 rounded-2xl p-3 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
          />
          <span className="text-xs text-gray-400">
            {cameraActive ? 'Proctoring Active' : 'Camera Off'}
          </span>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-40 h-28 rounded-xl object-cover bg-black"
        />
        {tabSwitchCount > 0 && (
          <div className="mt-2 px-2 py-1 bg-red-500/20 rounded-lg">
            <span className="text-red-400 text-xs">
              ⚠️ {tabSwitchCount} violation(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctoringMonitor;