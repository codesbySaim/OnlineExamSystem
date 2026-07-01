import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sessionAPI } from '../services/api';

const MyResults = ({ onBack }: { onBack: () => void }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getMySessions();
      setSessions(response.data);
    } catch (error) {
      toast.error('Failed to fetch results!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white">My Results</h1>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading results...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-12 border border-blue-500/20 rounded-2xl">
          You haven't attempted any exams yet!
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">{session.examTitle}</h3>
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    session.isPassed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {session.isPassed ? '✓ Passed' : '✗ Failed'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Score</p>
                  <p className="text-white font-bold text-lg">
                    {session.totalScore} / {session.totalMarks}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-white font-bold text-lg">{session.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-white font-bold text-lg">
                    {new Date(session.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResults;