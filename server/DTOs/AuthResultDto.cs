namespace practice_dotnet.DTOs
{
    public class AuthResultDto
    {
        public int Id { get; set; }
        public required string UserName { get; set; }
        public required bool IsAdmin { get; set; }
        public string?  AvatarUrl { get; set; }
        public required string Email { get; set; }
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
