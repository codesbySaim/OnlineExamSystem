namespace OnlineExam.Core.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Student"; // Admin, Teacher, Student
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public ICollection<ExamSession> ExamSessions { get; set; } = new List<ExamSession>();
        public ICollection<Exam> CreatedExams { get; set; } = new List<Exam>();
    }
}