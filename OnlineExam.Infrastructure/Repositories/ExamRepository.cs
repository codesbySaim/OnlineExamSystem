using Microsoft.EntityFrameworkCore;
using OnlineExam.Core.Interfaces;
using OnlineExam.Core.Models;
using OnlineExam.Infrastructure.Data;

namespace OnlineExam.Infrastructure.Repositories
{
    public class ExamRepository : IExamRepository
    {
        private readonly AppDbContext _context;

        public ExamRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Exam?> GetByIdAsync(int id)
        {
            return await _context.Exams
                .Include(e => e.Questions)
                .ThenInclude(q => q.Options)
                .Include(e => e.Teacher)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Exam>> GetAllAsync()
        {
            return await _context.Exams
                .Include(e => e.Teacher)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exam>> GetByTeacherIdAsync(int teacherId)
        {
            return await _context.Exams
                .Where(e => e.CreatedBy == teacherId)
                .Include(e => e.Questions)
                .ToListAsync();
        }

        public async Task<Exam> CreateAsync(Exam exam)
        {
            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();
            return exam;
        }

        public async Task<Exam> UpdateAsync(Exam exam)
        {
            _context.Exams.Update(exam);
            await _context.SaveChangesAsync();
            return exam;
        }

        public async Task DeleteAsync(int id)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam != null)
            {
                _context.Exams.Remove(exam);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Exams.AnyAsync(e => e.Id == id);
        }
    }
}