using OnlineExam.Core.Models;

namespace OnlineExam.Core.Interfaces
{
    public interface IExamRepository
    {
        Task<Exam?> GetByIdAsync(int id);
        Task<IEnumerable<Exam>> GetAllAsync();
        Task<IEnumerable<Exam>> GetByTeacherIdAsync(int teacherId);
        Task<Exam> CreateAsync(Exam exam);
        Task<Exam> UpdateAsync(Exam exam);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}