import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sessionAPI, proctoringAPI } from '../services/api';
import GradeAnswers from './GradeAnswers';

interface Props {
  examId: number;
  examTitle: string;
  onBack: () => void;
}

const ExamSessions: React.FC<Props> = ({ examId, examTitle, onBack }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [violationCounts, setViolationCounts] = useState<{ [key: number]: number }>({});
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [gradingSession, setGradingSession] = useState<{ id: number; studentName: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await sessionAPI.getExamSessions(examId);
      setSessions(response.data);

      // Fetch violation count for each session
      const counts: { [key: number]: number } = {};
      for (const session of response.data) {
        try {
          const violRes = await proctoringAPI.getViolationCount(session.id);
          counts[session.id] = violRes.data.violationCount;
        } catch (error) {
          counts[session.id] = 0;
        }
      }
      setViolationCounts(counts);
    } catch (error) {
      toast.error('Failed to fetch sessions!');
    } finally {
      setLoading(false);
    }
  };

  const viewLogs = async (sessionId: number) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }
    try {
      const response = await proctoringAPI.getSessionLogs(sessionId);
      setSessionLogs(response.data);
      setExpandedSession(sessionId);
    } catch (error) {
      toast.error('Failed to fetch logs!');
    }
  };

  if (gradingSession) {
    return (
      <GradeAnswers
        sessionId={gradingSession.id}
        studentName={gradingSession.studentName}
        onBack={() => { setGradingSession(null); fetchSessions(); }}
      />
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Student Submissions</h1>
          <p className="text-gray-400 mt-1">{examTitle}</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading submissions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-gray-400 py-12 border border-blue-500/20 rounded-2xl">
          No students have attempted this exam yet!
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
                <div>
                  <h3 className="text-lg font-bold text-white">{session.studentName}</h3>
                  <p className="text-gray-400 text-sm">{session.studentEmail}</p>
                </div>
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

              <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-400">Score</p>
                  <p className="text-white font-bold">{session.totalScore}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-white font-bold">{session.status}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="text-white font-bold">
                    {new Date(session.startTime).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Violations</p>
                  <p
                    className={`font-bold ${
                      (violationCounts[session.id] || 0) > 0 ? 'text-red-400' : 'text-green-400'
                    }`}
                  >
                    {violationCounts[session.id] || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                {(violationCounts[session.id] || 0) > 0 && (
                  <button
                    onClick={() => viewLogs(session.id)}
                    className="text-blue-400 text-sm font-medium hover:text-blue-300"
                  >
                    {expandedSession === session.id ? '▲ Hide' : '▼ View'} Violation Details
                  </button>
                )}

                {session.status === 'Completed' && (
                  <button
                    onClick={() =>
                      setGradingSession({ id: session.id, studentName: session.studentName })
                    }
                    className="text-purple-400 text-sm font-medium hover:text-purple-300"
                  >
                    ✍ Grade Answers
                  </button>
                )}
              </div>

              {expandedSession === session.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2 pt-4 border-t border-blue-500/10"
                >
                  {sessionLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-center text-sm px-3 py-2 rounded-lg bg-red-500/10"
                    >
                      <span className="text-red-400">⚠️ {log.eventType}</span>
                      <span className="text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          log.severity === 'High'
                            ? 'bg-red-500/20 text-red-400'
                            : log.severity === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamSessions;