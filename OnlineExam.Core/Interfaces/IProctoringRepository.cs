using OnlineExam.Core.Models;

namespace OnlineExam.Core.Interfaces
{
    public interface IProctoringRepository
    {
        Task<IEnumerable<ProctoringLog>> GetBySessionIdAsync(int sessionId);
        Task<ProctoringLog> CreateAsync(ProctoringLog log);
        Task<int> GetViolationCountAsync(int sessionId);
    }
}