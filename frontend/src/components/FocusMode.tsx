import React, { useEffect, useState } from 'react';
import { ZapOff, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface FocusModeProps {
  taskTitle: string;
  duration: number; // minutes
  onEnd: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ taskTitle, duration, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // in seconds
  const [isDimmed, setIsDimmed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndFocus();
    }
  }, [timeLeft]);

  const handleEndFocus = () => {
    // Play completion sound
    const audio = new Audio('/sounds/focus-complete.mp3');
    audio.play().catch(() => {
      // Fallback: alert if sound fails
    });

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Focus Session Complete! 🎉', {
        body: `Great job on: ${taskTitle}`,
        icon: '/icons/trophy.png'
      });
    }

    onEnd();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Dimmed Background */}
      <div className="absolute inset-0 bg-black opacity-30" />

      {/* Focus Card */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <div className="text-center">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <ZapOff className="text-blue-600" size={48} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Focus Mode Active</h2>
            <p className="text-gray-600 mb-6">{taskTitle}</p>

            {/* Timer */}
            <div className="text-6xl font-mono font-bold text-blue-600 mb-6">
              {formatTime(timeLeft)}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
              <motion.div
                className="bg-blue-500 h-full"
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>

            {/* Info */}
            <p className="text-sm text-gray-500 mb-6">
              📵 Notifications are silenced
              <br />
              🚫 Distracting sites are blocked
              <br />
              ✨ Stay focused!
            </p>

            {/* End Button */}
            <button
              onClick={handleEndFocus}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <X size={18} />
              End Focus Session
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
