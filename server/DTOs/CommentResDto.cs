namespace practice_dotnet.DTOs
{
    public class CommentResDto
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public required string Comment { get; set; }
        public required DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public required string Username { get; set; }
        public string? UserImageUrl { get; set; }
    }
}
