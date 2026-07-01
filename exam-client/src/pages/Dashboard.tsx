import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { examAPI } from '../services/api';
import CreateExam from './CreateExam';
import AddQuestions from './AddQuestions';
import TakeExam from './TakeExam';
import MyResults from './MyResults';
import ExamSessions from './ExamSessions';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{ id: number; title: string } | null>(null);
  const [examToTake, setExamToTake] = useState<{ id: number; title: string; duration: number } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [examSessionsView, setExamSessionsView] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await examAPI.getAll();
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exams!');
    } finally {
      setLoading(false);
    }
  };

  if (showCreateExam) {
    return <CreateExam onBack={() => { setShowCreateExam(false); fetchExams(); }} />;
  }

  if (selectedExam) {
    return (
      <AddQuestions
        examId={selectedExam.id}
        examTitle={selectedExam.title}
        onBack={() => setSelectedExam(null)}
      />
    );
  }

  if (examToTake) {
    return (
      <TakeExam
        examId={examToTake.id}
        examTitle={examToTake.title}
        duration={examToTake.duration}
        onBack={() => { setExamToTake(null); fetchExams(); }}
      />
    );
  }

  if (showResults) {
    return <MyResults onBack={() => setShowResults(false)} />;
  }

  if (examSessionsView) {
    return (
      <ExamSessions
        examId={examSessionsView.id}
        examTitle={examSessionsView.title}
        onBack={() => setExamSessionsView(null)}
      />
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome, <span className="text-blue-400">{user?.name}</span>
          </h1>
          <p className="text-gray-400 mt-1">Role: {user?.role}</p>
        </div>

        <div className="flex gap-3">
          {(user?.role === 'Teacher' || user?.role === 'Admin') && (
            <motion.button
              onClick={() => setShowCreateExam(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 rounded-xl text-white font-medium"
              style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
            >
              + Create Exam
            </motion.button>
          )}
          {user?.role === 'Student' && (
            <motion.button
              onClick={() => setShowResults(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 rounded-xl text-white font-medium"
              style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
            >
              📊 My Results
            </motion.button>
          )}
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Exams', value: exams.length, icon: '📝' },
          { label: 'Active Exams', value: exams.filter(e => e.isActive).length, icon: '✅' },
          { label: 'Your Role', value: user?.role, icon: '👤' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Exams List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Available Exams</h2>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="text-center text-gray-400 py-12 border border-blue-500/20 rounded-2xl">
            No exams available yet!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40 transition-all"
              >
                <h3 className="text-xl font-bold text-white mb-2">{exam.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{exam.description}</p>
                <div className="flex gap-4 text-sm text-gray-400 mb-4">
                  <span>⏱ {exam.duration} mins</span>
                  <span>📊 {exam.totalMarks} marks</span>
                  <span>✅ Pass: {exam.passingMarks}</span>
                </div>
                <div className="flex gap-4">
                  {(user?.role === 'Teacher' || user?.role === 'Admin') && (
                    <>
                      <button
                        onClick={() => setSelectedExam({ id: exam.id, title: exam.title })}
                        className="text-blue-400 text-sm font-medium hover:text-blue-300"
                      >
                        + Manage Questions
                      </button>
                      <button
                        onClick={() => setExamSessionsView({ id: exam.id, title: exam.title })}
                        className="text-purple-400 text-sm font-medium hover:text-purple-300"
                      >
                        👁 View Submissions
                      </button>
                    </>
                  )}
                  {user?.role === 'Student' && (
                    <button
                      onClick={() => setExamToTake({ id: exam.id, title: exam.title, duration: exam.duration })}
                      className="text-green-400 text-sm font-medium hover:text-green-300"
                    >
                      ▶ Start Exam
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;