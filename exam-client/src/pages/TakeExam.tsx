import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { questionAPI, sessionAPI } from '../services/api';
import axios from 'axios';
import ProctoringMonitor from '../components/ProctoringMonitor';

interface Props {
  examId: number;
  examTitle: string;
  duration: number;
  onBack: () => void;
}

const TakeExam: React.FC<Props> = ({ examId, examTitle, duration, onBack }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  useEffect(() => {
    startExam();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const startExam = async () => {
    try {
      const sessionRes = await sessionAPI.startExam(examId);
      setSessionId(sessionRes.data.session.id);

      const questionsRes = await questionAPI.getByExam(examId);
      setQuestions(questionsRes.data);
    } catch (error) {
      toast.error('Failed to start exam!');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (questionId: number, answerText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerText }));

    if (sessionId) {
      try {
        await axios.post(
          'http://localhost:5204/api/Answer',
          { sessionId, questionId, answerText },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (error) {
        console.error('Failed to save answer');
      }
    }
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    setSubmitted(true);
    try {
      await sessionAPI.submitExam(sessionId);
      toast.success('Exam submitted successfully!');
      setExamFinished(true);
      setTimeout(() => onBack(), 500);
    } catch (error) {
      toast.error('Failed to submit exam!');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-400 text-xl">Starting exam...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-6">No questions found for this exam!</p>
          <button
            onClick={onBack}
            className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      {sessionId && !examFinished && <ProctoringMonitor sessionId={sessionId} />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">{examTitle}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>
        <div
          className={`px-5 py-2 rounded-xl font-bold text-lg ${
            timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
          }`}
        >
          ⏱ {formatTime(timeLeft)}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-blue-500/10 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-6"
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-white">{currentQuestion.questionText}</h2>
          <span className="text-blue-400 text-sm whitespace-nowrap ml-4">
            {currentQuestion.marks} marks
          </span>
        </div>

        {currentQuestion.type === 'MCQ' ? (
          <div className="space-y-3">
            {currentQuestion.options.map((opt: any) => (
              <button
                key={opt.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, opt.id.toString())}
                className={`w-full text-left px-5 py-3 rounded-xl border transition-all ${
                  answers[currentQuestion.id] === opt.id.toString()
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-blue-500/20 text-gray-300 hover:border-blue-500/50'
                }`}
              >
                {opt.optionText}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-3 rounded-xl border border-blue-500/30 text-blue-400 disabled:opacity-30"
        >
          ← Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
          >
            Submit Exam ✓
          </motion.button>
        ) : (
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-6 py-3 rounded-xl text-white font-medium"
            style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeExam;