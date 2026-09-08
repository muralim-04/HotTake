using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Helpers;

namespace practice_dotnet.Services.AuthService
{
    public interface IAuthService
    {
        Task<Response<AuthResultDto>> Register(UserReqDto user);
        Task<Response<AuthResultDto>> LogIn(LogInDto user);
        Task<Response<AuthResultDto>> RefreshToken(string rawRefreshToken);
        Task<Response<bool>> LogOut(int userId);
    }
}
