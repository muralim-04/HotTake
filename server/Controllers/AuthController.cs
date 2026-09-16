using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Services.AuthService;
using System.Security.Claims;

namespace practice_dotnet.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserResDto>> Register([FromBody] UserReqDto user)
        {
            var response = await _authService.Register(user);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            SetRefreshTokenCookie(response.Data.RefreshToken);

            var result = new UserResDto
            {
                Id = response.Data.Id,
                UserName = response.Data.UserName,
                AvatarUrl = response.Data.AvatarUrl,
                IsAdmin = response.Data.IsAdmin,
                Email = response.Data.Email,
                Token = response.Data.AccessToken
            };
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserResDto>> LogIn([FromBody] LogInDto user)
        {
            var response = await _authService.LogIn(user);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            SetRefreshTokenCookie(response.Data.RefreshToken);

            var result = new UserResDto
            {
                Id = response.Data.Id,
                UserName = response.Data.UserName,
                AvatarUrl = response.Data.AvatarUrl,
                IsAdmin = response.Data.IsAdmin,
                Email = response.Data.Email,
                Token = response.Data.AccessToken
            };
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<UserResDto>> Refresh()
        {
            var rawRefreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(rawRefreshToken))
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: "You don't have the token, please login again"
                );
            }

            var response = await _authService.RefreshToken(rawRefreshToken);

            if (!response.Success)
            {
                Response.Cookies.Delete("refreshToken");
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            SetRefreshTokenCookie(response.Data.RefreshToken);

            var result = new UserResDto
            {
                Id = response.Data.Id,
                UserName = response.Data.UserName,
                AvatarUrl = response.Data.AvatarUrl,
                IsAdmin = response.Data.IsAdmin,
                Email = response.Data.Email,
                Token = response.Data.AccessToken
            };
            return Ok(result);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<ActionResult<bool>> Logout()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var response = await _authService.LogOut(userId);

            Response.Cookies.Append("refreshToken", "", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(-1)
            });

            return Ok(response.Data);
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,          
                Secure = true,                
                SameSite = SameSiteMode.None,   
                Expires = DateTime.UtcNow.AddDays(7),               
            };

            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}
