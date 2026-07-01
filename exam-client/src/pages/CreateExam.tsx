import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { examAPI } from '../services/api';

const CreateExam = ({ onBack }: { onBack: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(40);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !startTime || !endTime) {
      toast.error('Please fill all required fields!');
      return;
    }
    setLoading(true);
    try {
      await examAPI.create({
        title,
        description,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration,
        totalMarks,
        passingMarks,
      });
      toast.success('Exam created successfully!');
      onBack();
    } catch (error: any) {
      console.error('Error details:', JSON.stringify(error.response?.data?.errors));
      toast.error('Failed to create exam!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Create New Exam</h1>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-5"
      >
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Exam Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Web Development Final Exam"
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Exam description..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Duration (mins)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Passing Marks</label>
            <input
              type="number"
              value={passingMarks}
              onChange={(e) => setPassingMarks(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <motion.button
          onClick={handleCreate}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-70"
          style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
        >
          {loading ? 'Creating...' : 'Create Exam'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CreateExam;