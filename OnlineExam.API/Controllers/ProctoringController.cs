using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineExam.Core.Interfaces;
using OnlineExam.Core.Models;

namespace OnlineExam.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProctoringController : ControllerBase
    {
        private readonly IProctoringRepository _proctoringRepository;

        public ProctoringController(IProctoringRepository proctoringRepository)
        {
            _proctoringRepository = proctoringRepository;
        }

        [HttpPost("log")]
        public async Task<IActionResult> LogViolation([FromBody] ProctoringLogDto dto)
        {
            var log = new ProctoringLog
            {
                SessionId = dto.SessionId,
                EventType = dto.EventType,
                Severity = dto.Severity,
                ScreenshotUrl = dto.ScreenshotUrl,
                Timestamp = DateTime.UtcNow
            };

            await _proctoringRepository.CreateAsync(log);
            return Ok(new { message = "Violation logged", log });
        }

        [HttpGet("session/{sessionId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetSessionLogs(int sessionId)
        {
            var logs = await _proctoringRepository.GetBySessionIdAsync(sessionId);
            return Ok(logs);
        }

        [HttpGet("violations/{sessionId}")]
        public async Task<IActionResult> GetViolationCount(int sessionId)
        {
            var count = await _proctoringRepository.GetViolationCountAsync(sessionId);
            return Ok(new { sessionId, violationCount = count });
        }
    }

    public class ProctoringLogDto
    {
        public int SessionId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string Severity { get; set; } = "Low";
        public string? ScreenshotUrl { get; set; }
    }
}