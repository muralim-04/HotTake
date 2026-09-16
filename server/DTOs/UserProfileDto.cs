using practice_dotnet.Entities;

namespace practice_dotnet.DTOs
{
    public class UserProfileDto
    {
        public string? UserName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public required string Email { get; set; }

    }
}
