namespace OnlineExam.Core.Models
{
    public class ProctoringLog
    {
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string EventType { get; set; } = string.Empty; // FaceNotDetected, MultipleFaces, TabSwitch, LookingAway
        public string Severity { get; set; } = "Low"; // Low, Medium, High
        public string? ScreenshotUrl { get; set; }

        // Foreign Key
        public int SessionId { get; set; }

        // Navigation Property
        public ExamSession ExamSession { get; set; } = null!;
    }
}