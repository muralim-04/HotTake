namespace practice_dotnet.Entities
{
    public class PostLike
    {
        public int PostId { get; set; }
        public UserPost UserPost { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
