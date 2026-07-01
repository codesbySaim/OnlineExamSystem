using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlineExam.Core.Models;
using OnlineExam.Infrastructure.Data;

namespace OnlineExam.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnswerController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnswerController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitAnswer([FromBody] SubmitAnswerDto dto)
        {
            var question = await _context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == dto.QuestionId);

            if (question == null)
                return NotFound(new { message = "Question not found" });

            // Check if answer already exists for this session+question
            var existingAnswer = await _context.Answers
                .FirstOrDefaultAsync(a => a.SessionId == dto.SessionId && a.QuestionId == dto.QuestionId);

            bool isCorrect = false;
            int marksObtained = 0;

            // Auto-grade MCQ
            if (question.Type == "MCQ")
            {
                var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);
                if (correctOption != null && correctOption.Id.ToString() == dto.AnswerText)
                {
                    isCorrect = true;
                    marksObtained = question.Marks;
                }
            }

            if (existingAnswer != null)
            {
                existingAnswer.AnswerText = dto.AnswerText;
                existingAnswer.IsCorrect = isCorrect;
                existingAnswer.MarksObtained = marksObtained;
                existingAnswer.GradedAt = question.Type == "MCQ" ? DateTime.UtcNow : null;
                _context.Answers.Update(existingAnswer);
            }
            else
            {
                var answer = new Answer
                {
                    SessionId = dto.SessionId,
                    QuestionId = dto.QuestionId,
                    AnswerText = dto.AnswerText,
                    IsCorrect = isCorrect,
                    MarksObtained = marksObtained,
                    GradedAt = question.Type == "MCQ" ? DateTime.UtcNow : null
                };
                _context.Answers.Add(answer);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Answer saved" });
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetBySession(int sessionId)
        {
            var answers = await _context.Answers
                .Where(a => a.SessionId == sessionId)
                .ToListAsync();
            return Ok(answers);
        }

        [HttpGet("ungraded/{sessionId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetUngradedAnswers(int sessionId)
        {
            var answers = await _context.Answers
                .Where(a => a.SessionId == sessionId)
                .Include(a => a.Question)
                .ToListAsync();

            var result = answers
                .Where(a => a.Question.Type == "Short" || a.Question.Type == "Long")
                .Select(a => new
                {
                    a.Id,
                    a.AnswerText,
                    a.MarksObtained,
                    a.GradedAt,
                    QuestionText = a.Question.QuestionText,
                    QuestionMarks = a.Question.Marks,
                    QuestionType = a.Question.Type
                });

            return Ok(result);
        }

        [HttpPut("grade/{answerId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GradeAnswer(int answerId, [FromBody] GradeAnswerDto dto)
        {
            var answer = await _context.Answers.FindAsync(answerId);
            if (answer == null)
                return NotFound(new { message = "Answer not found" });

            answer.MarksObtained = dto.Marks;
            answer.GradedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Recalculate session total score
            var session = await _context.ExamSessions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == answer.SessionId);

            if (session != null)
            {
                session.TotalScore = session.Answers.Sum(a => a.MarksObtained);
                var exam = await _context.Exams.FindAsync(session.ExamId);
                if (exam != null)
                {
                    session.IsPassed = session.TotalScore >= exam.PassingMarks;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Answer graded successfully" });
        }
    }

    public class SubmitAnswerDto
    {
        public int SessionId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; } = string.Empty;
    }

    public class GradeAnswerDto
    {
        public int Marks { get; set; }
    }
}