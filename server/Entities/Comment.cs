using System.Reflection.PortableExecutable;

namespace practice_dotnet.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public required string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // foreign key to post
        public int PostId { get; set; }
        public UserPost UserPost { get; set; } = null!;

        // foreign key to user
        public int UserId { get; set; }
        public User User { get; set; } = null!;

    }
}
