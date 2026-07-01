namespace OnlineExam.Core.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Type { get; set; } = "MCQ"; // MCQ, Short, Long
        public int Marks { get; set; }
        public int Order { get; set; }

        // Foreign Key
        public int ExamId { get; set; }

        // Navigation Properties
        public Exam Exam { get; set; } = null!;
        public ICollection<Option> Options { get; set; } = new List<Option>();
        public ICollection<Answer> Answers { get; set; } = new List<Answer>();
    }
}