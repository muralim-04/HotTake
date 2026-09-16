namespace practice_dotnet.Entities
{
    public class UserPost
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // navigation properties
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    }
}
