namespace practice_dotnet.DTOs
{
    public class UserResDto
    {
        public int Id { get; set; }
        public string? UserName { get; set; }
        public string?  Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public bool? IsAdmin { get; set; }
        public string? Email { get; set; }
        public string? Token { get; set; }
    }
}
