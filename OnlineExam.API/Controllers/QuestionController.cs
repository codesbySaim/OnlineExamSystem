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
    public class QuestionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuestionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("exam/{examId}")]
        public async Task<IActionResult> GetByExam(int examId)
        {
            var questions = await _context.Questions
                .Where(q => q.ExamId == examId)
                .Include(q => q.Options)
                .OrderBy(q => q.Order)
                .ToListAsync();

            var result = questions.Select(q => new
            {
                q.Id,
                q.QuestionText,
                q.Type,
                q.Marks,
                q.Order,
                Options = q.Options.Select(o => new { o.Id, o.OptionText, o.IsCorrect })
            });

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateQuestionDto dto)
        {
            var question = new Question
            {
                ExamId = dto.ExamId,
                QuestionText = dto.QuestionText,
                Type = dto.Type,
                Marks = dto.Marks,
                Order = dto.Order
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            if (dto.Type == "MCQ" && dto.Options != null)
            {
                foreach (var opt in dto.Options)
                {
                    _context.Options.Add(new Option
                    {
                        QuestionId = question.Id,
                        OptionText = opt.OptionText,
                        IsCorrect = opt.IsCorrect
                    });
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Question added successfully", questionId = question.Id });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                return NotFound(new { message = "Question not found" });

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Question deleted successfully" });
        }
    }

    public class CreateQuestionDto
    {
        public int ExamId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Type { get; set; } = "MCQ";
        public int Marks { get; set; }
        public int Order { get; set; }
        public List<OptionDto>? Options { get; set; }
    }

    public class OptionDto
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}