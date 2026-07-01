using OnlineExam.Core.Models;

namespace OnlineExam.Core.Interfaces
{
    public interface IExamSessionRepository
    {
        Task<ExamSession?> GetByIdAsync(int id);
        Task<IEnumerable<ExamSession>> GetByStudentIdAsync(int studentId);
        Task<IEnumerable<ExamSession>> GetByExamIdAsync(int examId);
        Task<ExamSession> CreateAsync(ExamSession session);
        Task<ExamSession> UpdateAsync(ExamSession session);
        Task<bool> ExistsAsync(int examId, int studentId);
    }
}