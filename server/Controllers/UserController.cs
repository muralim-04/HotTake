using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Services.UserServices;
using System.Security.Claims;

namespace practice_dotnet.Controllers
{
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<ActionResult<UserProfileDto>> GetUserProfile()
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _userService.GetUserProfile(userId);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            return Ok(response.Data);
        }

        [Authorize]
        [HttpPatch("details")]
        public async Task<ActionResult<UserProfileDto>> UpdateUserDetails([FromBody] UpdateUserDto userDetails)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _userService.UpdateUserDeatail(userId, userDetails);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            return Ok(response.Data);
        }

        [Authorize]
        [HttpPatch("avatar")]
        public async Task<ActionResult<UserProfileDto>> UpdateUserAvatar([FromForm] AvatarDto avatar)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _userService.UpdateUserAvatar(userId, avatar);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            return Ok(response.Data);
        }
    }
}
