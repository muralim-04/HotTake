using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.RazorPages;
using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Helpers;
using practice_dotnet.Services.PostServices;
using System.Security.Claims;

namespace practice_dotnet.Controllers
{
    [Route("api/post")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        [Authorize]
        [HttpPost("createPost")]
        public async Task<ActionResult<PostResDto>> CreatePost([FromForm] PostReqDto post)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _postService.CreatePost(post, userId);

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

        [HttpGet("getAllPosts")]
        public async Task<ActionResult<PagedResult<PostResDto>>> GetAllPosts(int pageNumber = 1, int pageSize = 10)
        {
            int? userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var parsedId)
                ? parsedId
                : null;

            var response = await _postService.GetAllPosts(pageNumber, pageSize, userId);

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

        [HttpGet("getPost/{postId}")]
        public async Task<ActionResult<PostResDto>> GetPost(int postId)
        {
            int? userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var parsedId)
                ? parsedId
                : null;

            var response = await _postService.GetPost(postId, userId);

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
        [HttpDelete("deletePost/{postId}")]
        public async Task<ActionResult<bool>> DeletePost(int postId)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var response = await _postService.DeletePost(postId, userId, isAdmin);

            if (!response.Success)
            {
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "Bad Request",
                    detail: response.Message
                );
            }

            return Ok(true);
        }

        [Authorize]
        [HttpPost("likeThePost/{postId}")]
        public async Task<ActionResult<LikeResDto>> LikeThePost(int postId)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _postService.LikePost(userId, postId);

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
        [HttpPost("leaveComment")]
        public async Task<ActionResult<CommentResDto>> LeaveComment([FromBody] CommentReqDto comment)
        {
            int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var response = await _postService.CreateComment(userId, comment);

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
