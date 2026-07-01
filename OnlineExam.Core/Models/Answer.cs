namespace OnlineExam.Core.Models
{
    public class Answer
    {
        public int Id { get; set; }
        public string AnswerText { get; set; } = string.Empty;
        public int MarksObtained { get; set; } = 0;
        public bool IsCorrect { get; set; } = false;
        public DateTime? GradedAt { get; set; }

        // Foreign Keys
        public int SessionId { get; set; }
        public int QuestionId { get; set; }

        // Navigation Properties
        public ExamSession ExamSession { get; set; } = null!;
        public Question Question { get; set; } = null!;
    }
}