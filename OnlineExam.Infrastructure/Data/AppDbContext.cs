using Microsoft.EntityFrameworkCore;
using OnlineExam.Core.Models;

namespace OnlineExam.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<Option> Options { get; set; }
        public DbSet<ExamSession> ExamSessions { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<ProctoringLog> ProctoringLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Role).HasDefaultValue("Student");
            });

            // Exam
            modelBuilder.Entity<Exam>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Teacher)
                    .WithMany(u => u.CreatedExams)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Question
            modelBuilder.Entity<Question>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Exam)
                    .WithMany(ex => ex.Questions)
                    .HasForeignKey(e => e.ExamId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Option
            modelBuilder.Entity<Option>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Question)
                    .WithMany(q => q.Options)
                    .HasForeignKey(e => e.QuestionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ExamSession
            modelBuilder.Entity<ExamSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Exam)
                    .WithMany(ex => ex.ExamSessions)
                    .HasForeignKey(e => e.ExamId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Student)
                    .WithMany(u => u.ExamSessions)
                    .HasForeignKey(e => e.StudentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Answer
            modelBuilder.Entity<Answer>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ExamSession)
                    .WithMany(s => s.Answers)
                    .HasForeignKey(e => e.SessionId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Question)
                    .WithMany(q => q.Answers)
                    .HasForeignKey(e => e.QuestionId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ProctoringLog
            modelBuilder.Entity<ProctoringLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.ExamSession)
                    .WithMany(s => s.ProctoringLogs)
                    .HasForeignKey(e => e.SessionId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}