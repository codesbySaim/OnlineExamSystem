using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Core.Interfaces;
using OnlineExam.Core.Models;
using System.Security.Claims;

namespace OnlineExam.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExamSessionController : ControllerBase
    {
        private readonly IExamSessionRepository _sessionRepository;
        private readonly IExamRepository _examRepository;

        public ExamSessionController(IExamSessionRepository sessionRepository, IExamRepository examRepository)
        {
            _sessionRepository = sessionRepository;
            _examRepository = examRepository;
        }

        [HttpPost("start/{examId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> StartExam(int examId)
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (!await _examRepository.ExistsAsync(examId))
                return NotFound(new { message = "Exam not found" });

            var studentSessions = await _sessionRepository.GetByStudentIdAsync(studentId);
            var existingSession = studentSessions.FirstOrDefault(s => s.ExamId == examId);

            if (existingSession != null)
            {
                if (existingSession.Status == "Completed")
                    return BadRequest(new { message = "You have already attempted this exam" });

                // Resume the incomplete session instead of blocking
                return Ok(new
                {
                    message = "Resuming exam",
                    session = new
                    {
                        existingSession.Id,
                        existingSession.ExamId,
                        existingSession.StudentId,
                        existingSession.StartTime,
                        existingSession.Status
                    }
                });
            }

            var session = new ExamSession
            {
                ExamId = examId,
                StudentId = studentId,
                StartTime = DateTime.UtcNow,
                Status = "Active"
            };

            await _sessionRepository.CreateAsync(session);

            return Ok(new
            {
                message = "Exam started",
                session = new
                {
                    session.Id,
                    session.ExamId,
                    session.StudentId,
                    session.StartTime,
                    session.Status
                }
            });
        }

        [HttpPost("submit/{sessionId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> SubmitExam(int sessionId)
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId);
            if (session == null)
                return NotFound(new { message = "Session not found" });

            session.EndTime = DateTime.UtcNow;
            session.Status = "Completed";

            // Calculate score
            int totalScore = 0;
            foreach (var answer in session.Answers)
            {
                totalScore += answer.MarksObtained;
            }

            session.TotalScore = totalScore;
            session.IsPassed = totalScore >= session.Exam.PassingMarks;

            await _sessionRepository.UpdateAsync(session);

            return Ok(new
            {
                message = "Exam submitted",
                sessionId = session.Id,
                totalScore = session.TotalScore,
                isPassed = session.IsPassed,
                passingMarks = session.Exam.PassingMarks,
                totalMarks = session.Exam.TotalMarks
            });
        }

        [HttpGet("my-sessions")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMySessions()
        {
            var studentId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var sessions = await _sessionRepository.GetByStudentIdAsync(studentId);

            var result = sessions
                .Where(s => s.Status == "Completed")
                .Select(s => new
                {
                    s.Id,
                    s.ExamId,
                    s.StartTime,
                    s.EndTime,
                    s.Status,
                    s.TotalScore,
                    s.IsPassed,
                    ExamTitle = s.Exam.Title,
                    TotalMarks = s.Exam.TotalMarks
                });

            return Ok(result);
        }

        [HttpGet("exam/{examId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetExamSessions(int examId)
        {
            var sessions = await _sessionRepository.GetByExamIdAsync(examId);

            // Per student, prefer the Completed session; drop leftover incomplete duplicates
            var latestPerStudent = sessions
                .GroupBy(s => s.StudentId)
                .Select(g => g.OrderByDescending(s => s.Status == "Completed")
                              .ThenByDescending(s => s.StartTime)
                              .First());

            var result = latestPerStudent.Select(s => new
            {
                s.Id,
                s.StudentId,
                s.StartTime,
                s.EndTime,
                s.Status,
                s.TotalScore,
                s.IsPassed,
                StudentName = s.Student.Name,
                StudentEmail = s.Student.Email
            });

            return Ok(result);
        }
    }
}