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
    public class ExamController : ControllerBase
    {
        private readonly IExamRepository _examRepository;

        public ExamController(IExamRepository examRepository)
        {
            _examRepository = examRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var exams = await _examRepository.GetAllAsync();
            var result = exams.Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.StartTime,
                e.EndTime,
                e.Duration,
                e.TotalMarks,
                e.PassingMarks,
                e.IsActive,
                e.CreatedAt,
                TeacherName = e.Teacher != null ? e.Teacher.Name : ""
            });
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var exam = await _examRepository.GetByIdAsync(id);
            if (exam == null)
                return NotFound(new { message = "Exam not found" });

            var result = new
            {
                exam.Id,
                exam.Title,
                exam.Description,
                exam.StartTime,
                exam.EndTime,
                exam.Duration,
                exam.TotalMarks,
                exam.PassingMarks,
                exam.IsActive,
                exam.CreatedAt,
                TeacherName = exam.Teacher != null ? exam.Teacher.Name : "",
                Questions = exam.Questions.Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.Type,
                    q.Marks,
                    q.Order,
                    Options = q.Options.Select(o => new { o.Id, o.OptionText, o.IsCorrect })
                })
            };
            return Ok(result);
        }

        [HttpGet("my-exams")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetMyExams()
        {
            var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var exams = await _examRepository.GetByTeacherIdAsync(teacherId);
            var result = exams.Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.StartTime,
                e.EndTime,
                e.Duration,
                e.TotalMarks,
                e.PassingMarks,
                e.IsActive,
                e.CreatedAt
            });
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateExamDto dto)
        {
            var teacherId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var exam = new Exam
            {
                Title = dto.Title,
                Description = dto.Description,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Duration = dto.Duration,
                TotalMarks = dto.TotalMarks,
                PassingMarks = dto.PassingMarks,
                CreatedBy = teacherId
            };

            await _examRepository.CreateAsync(exam);
            return Ok(new { message = "Exam created successfully", examId = exam.Id });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateExamDto dto)
        {
            var exam = await _examRepository.GetByIdAsync(id);
            if (exam == null)
                return NotFound(new { message = "Exam not found" });

            exam.Title = dto.Title;
            exam.Description = dto.Description;
            exam.StartTime = dto.StartTime;
            exam.EndTime = dto.EndTime;
            exam.Duration = dto.Duration;
            exam.TotalMarks = dto.TotalMarks;
            exam.PassingMarks = dto.PassingMarks;

            await _examRepository.UpdateAsync(exam);
            return Ok(new { message = "Exam updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!await _examRepository.ExistsAsync(id))
                return NotFound(new { message = "Exam not found" });

            await _examRepository.DeleteAsync(id);
            return Ok(new { message = "Exam deleted successfully" });
        }
    }

    public class CreateExamDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Duration { get; set; }
        public int TotalMarks { get; set; }
        public int PassingMarks { get; set; }
    }
}