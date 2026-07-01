namespace OnlineExam.Core.Models
{
    public class Option
    {
        public int Id { get; set; }
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;

        // Foreign Key
        public int QuestionId { get; set; }

        // Navigation Property
        public Question Question { get; set; } = null!;
    }
}