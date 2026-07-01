using Microsoft.EntityFrameworkCore;
using OnlineExam.Core.Interfaces;
using OnlineExam.Core.Models;
using OnlineExam.Infrastructure.Data;

namespace OnlineExam.Infrastructure.Repositories
{
    public class ExamSessionRepository : IExamSessionRepository
    {
        private readonly AppDbContext _context;

        public ExamSessionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ExamSession?> GetByIdAsync(int id)
        {
            return await _context.ExamSessions
                .Include(s => s.Exam)
                .Include(s => s.Student)
                .Include(s => s.Answers)
                .Include(s => s.ProctoringLogs)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<ExamSession>> GetByStudentIdAsync(int studentId)
        {
            return await _context.ExamSessions
                .Where(s => s.StudentId == studentId)
                .Include(s => s.Exam)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamSession>> GetByExamIdAsync(int examId)
        {
            return await _context.ExamSessions
                .Where(s => s.ExamId == examId)
                .Include(s => s.Student)
                .ToListAsync();
        }

        public async Task<ExamSession> CreateAsync(ExamSession session)
        {
            _context.ExamSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<ExamSession> UpdateAsync(ExamSession session)
        {
            _context.ExamSessions.Update(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task<bool> ExistsAsync(int examId, int studentId)
        {
            return await _context.ExamSessions
                .AnyAsync(s => s.ExamId == examId && s.StudentId == studentId);
        }
    }
}