using Microsoft.EntityFrameworkCore;
using OnlineExam.Core.Interfaces;
using OnlineExam.Core.Models;
using OnlineExam.Infrastructure.Data;

namespace OnlineExam.Infrastructure.Repositories
{
    public class ProctoringRepository : IProctoringRepository
    {
        private readonly AppDbContext _context;

        public ProctoringRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProctoringLog>> GetBySessionIdAsync(int sessionId)
        {
            return await _context.ProctoringLogs
                .Where(p => p.SessionId == sessionId)
                .OrderByDescending(p => p.Timestamp)
                .ToListAsync();
        }

        public async Task<ProctoringLog> CreateAsync(ProctoringLog log)
        {
            _context.ProctoringLogs.Add(log);
            await _context.SaveChangesAsync();
            return log;
        }

        public async Task<int> GetViolationCountAsync(int sessionId)
        {
            return await _context.ProctoringLogs
                .CountAsync(p => p.SessionId == sessionId);
        }
    }
}