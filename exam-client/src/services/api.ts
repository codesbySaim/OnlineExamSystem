import axios from 'axios';

const API_BASE_URL = 'https://onlineexamsystem-production-e8c8.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token auto attach karo har request mein
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/Auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/Auth/login', data),
};

// Exam APIs
export const examAPI = {
  getAll: () => api.get('/Exam'),
  getById: (id: number) => api.get(`/Exam/${id}`),
  getMyExams: () => api.get('/Exam/my-exams'),
  create: (data: any) => api.post('/Exam', data),
  update: (id: number, data: any) => api.put(`/Exam/${id}`, data),
  delete: (id: number) => api.delete(`/Exam/${id}`),
};

// Question APIs
export const questionAPI = {
  getByExam: (examId: number) => api.get(`/Question/exam/${examId}`),
  create: (data: any) => api.post('/Question', data),
  delete: (id: number) => api.delete(`/Question/${id}`),
};

// Session APIs
export const sessionAPI = {
  startExam: (examId: number) => api.post(`/ExamSession/start/${examId}`),
  submitExam: (sessionId: number) => api.post(`/ExamSession/submit/${sessionId}`),
  getMySessions: () => api.get('/ExamSession/my-sessions'),
  getExamSessions: (examId: number) => api.get(`/ExamSession/exam/${examId}`),
};

// Grading APIs
export const gradingAPI = {
  getUngradedAnswers: (sessionId: number) => api.get(`/Answer/ungraded/${sessionId}`),
  gradeAnswer: (answerId: number, marks: number) => api.put(`/Answer/grade/${answerId}`, { marks }),
};

// Proctoring APIs
export const proctoringAPI = {
  logViolation: (data: { sessionId: number; eventType: string; severity: string; screenshotUrl?: string }) =>
    api.post('/Proctoring/log', data),
  getSessionLogs: (sessionId: number) => api.get(`/Proctoring/session/${sessionId}`),
  getViolationCount: (sessionId: number) => api.get(`/Proctoring/violations/${sessionId}`),
};

export default api;