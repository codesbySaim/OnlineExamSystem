namespace OnlineExam.Core.Models
{
    public class ExamSession
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndTime { get; set; }
        public string Status { get; set; } = "Active"; // Active, Completed, Terminated
        public int TotalScore { get; set; } = 0;
        public bool IsPassed { get; set; } = false;

        // Foreign Keys
        public int ExamId { get; set; }
        public int StudentId { get; set; }

        // Navigation Properties
        public Exam Exam { get; set; } = null!;
        public User Student { get; set; } = null!;
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
        public ICollection<ProctoringLog> ProctoringLogs { get; set; } = new List<ProctoringLog>();
    }
}