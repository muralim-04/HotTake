using practice_dotnet.Entities;

namespace practice_dotnet.DTOs
{
    public class  PostResDto
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public string? ImageUrl { get; set; }
        public required DateTime CreatedAt { get; set; }

        // User info
        public int UserId { get; set; }
        public required string Username { get; set; }
        public string? UserProfileImageUrl { get; set; }

        // Post info
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public bool IsLikedByCurrentUser { get; set; }
    }
}
