using System.ComponentModel.DataAnnotations;

namespace practice_dotnet.Entities
{
    public class User
    {
        public int Id { get; set; }
        public required string UserName { get; set; }
        public string Bio { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string PasswordHash { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public required string Email { get; set; }

        //navigation properties
        public RefreshToken? RefreshToken { get; set; }
        public ICollection<UserPost> UserPosts { get; set; } = new List<UserPost>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
    }
}
