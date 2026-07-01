import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { questionAPI } from '../services/api';

interface Props {
  examId: number;
  examTitle: string;
  onBack: () => void;
}

const AddQuestions: React.FC<Props> = ({ examId, examTitle, onBack }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [type, setType] = useState('MCQ');
  const [marks, setMarks] = useState(5);
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await questionAPI.getByExam(examId);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to fetch questions!');
    }
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].optionText = text;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleAddQuestion = async () => {
    if (!questionText) {
      toast.error('Please enter question text!');
      return;
    }
    if (type === 'MCQ' && options.some((o) => !o.optionText)) {
      toast.error('Please fill all options!');
      return;
    }
    if (type === 'MCQ' && !options.some((o) => o.isCorrect)) {
      toast.error('Please select correct answer!');
      return;
    }

    setLoading(true);
    try {
      await questionAPI.create({
        examId,
        questionText,
        type,
        marks,
        order: questions.length + 1,
        options: type === 'MCQ' ? options : null,
      });
      toast.success('Question added!');
      setQuestionText('');
      setOptions([
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ]);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to add question!');
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
        <div>
          <h1 className="text-3xl font-bold text-white">Add Questions</h1>
          <p className="text-gray-400 mt-1">{examTitle}</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
        >
          ← Back
        </button>
      </motion.div>

      {/* Add Question Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-8 space-y-5"
      >
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Question Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="MCQ">MCQ</option>
              <option value="Short">Short Answer</option>
              <option value="Long">Long Answer</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {type === 'MCQ' && (
          <div className="space-y-3">
            <label className="text-gray-400 text-sm block">Options (select correct answer)</label>
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  checked={opt.isCorrect}
                  onChange={() => handleCorrectChange(index)}
                  className="w-5 h-5 accent-blue-500"
                />
                <input
                  type="text"
                  value={opt.optionText}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        )}

        <motion.button
          onClick={handleAddQuestion}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 disabled:opacity-70"
          style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
        >
          {loading ? 'Adding...' : '+ Add Question'}
        </motion.button>
      </motion.div>

      {/* Questions List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Questions ({questions.length})
        </h2>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-medium">
                  {index + 1}. {q.questionText}
                </span>
                <span className="text-blue-400 text-sm">{q.marks} marks</span>
              </div>
              {q.type === 'MCQ' && (
                <div className="ml-4 space-y-1 mt-2">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`text-sm ${opt.isCorrect ? 'text-green-400' : 'text-gray-400'}`}
                    >
                      {opt.isCorrect ? '✓' : '○'} {opt.optionText}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;