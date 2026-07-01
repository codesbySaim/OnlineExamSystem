import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { gradingAPI } from '../services/api';

interface Props {
  sessionId: number;
  studentName: string;
  onBack: () => void;
}

const GradeAnswers: React.FC<Props> = ({ sessionId, studentName, onBack }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marksInput, setMarksInput] = useState<{ [key: number]: number }>({});
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    try {
      const response = await gradingAPI.getUngradedAnswers(sessionId);
      setAnswers(response.data);
      const initialMarks: { [key: number]: number } = {};
      response.data.forEach((a: any) => {
        initialMarks[a.id] = a.marksObtained;
      });
      setMarksInput(initialMarks);
    } catch (error) {
      toast.error('Failed to fetch answers!');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (answerId: number, questionMarks: number) => {
    const marks = marksInput[answerId] ?? 0;
    if (marks < 0 || marks > questionMarks) {
      toast.error(`Marks must be between 0 and ${questionMarks}!`);
      return;
    }
    setSaving((prev) => ({ ...prev, [answerId]: true }));
    try {
      await gradingAPI.gradeAnswer(answerId, marks);
      toast.success('Marks saved!');
      fetchAnswers();
    } catch (error) {
      toast.error('Failed to save marks!');
    } finally {
      setSaving((prev) => ({ ...prev, [answerId]: false }));
    }
  };

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Grade Answers</h1>
          <p className="text-gray-400 mt-1">{studentName}</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading answers...</div>
      ) : answers.length === 0 ? (
        <div className="text-center text-gray-400 py-12 border border-blue-500/20 rounded-2xl">
          No Short/Long answer questions to grade!
        </div>
      ) : (
        <div className="space-y-5">
          {answers.map((ans, index) => (
            <motion.div
              key={ans.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-semibold">{ans.questionText}</h3>
                <span className="text-blue-400 text-sm whitespace-nowrap ml-4">
                  {ans.questionType} • Max {ans.questionMarks} marks
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0f1e] border border-blue-500/10 mb-4">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {ans.answerText || <span className="text-gray-600 italic">No answer given</span>}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-gray-400 text-sm">Marks:</label>
                <input
                  type="number"
                  min={0}
                  max={ans.questionMarks}
                  value={marksInput[ans.id] ?? 0}
                  onChange={(e) =>
                    setMarksInput((prev) => ({ ...prev, [ans.id]: Number(e.target.value) }))
                  }
                  className="w-24 px-3 py-2 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-400 text-sm">/ {ans.questionMarks}</span>

                <motion.button
                  onClick={() => handleGrade(ans.id, ans.questionMarks)}
                  disabled={saving[ans.id]}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="ml-auto px-5 py-2 rounded-xl text-white font-medium text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
                >
                  {saving[ans.id] ? 'Saving...' : ans.gradedAt ? '✓ Update Marks' : 'Save Marks'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeAnswers;