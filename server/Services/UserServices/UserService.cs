using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using practice_dotnet.Data;
using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Helpers;
using practice_dotnet.Services.BlobService;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace practice_dotnet.Services.UserServices
{
    public class UserService : IUserService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _environment;
        private readonly IBlobService _blobService;
        public UserService(DataContext context, IConfiguration config, IWebHostEnvironment environment, IBlobService blobService)
        {
            _context = context;
            _config = config;
            _environment = environment;
            _blobService = blobService;
        }

        public async Task<Response<bool>> DeleteAccount(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return Response<bool>.Fail("User was not found");
            }

            var userLikes = _context.PostLikes.Where(l => l.UserId == id);
            _context.PostLikes.RemoveRange(userLikes);

            var userComments = _context.Comments.Where(c => c.UserId == id);
            _context.Comments.RemoveRange(userComments);

            var userToken = _context.RefreshTokens.Where(rt => rt.UserId == id);
            _context.RefreshTokens.RemoveRange(userToken);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Response<bool>.Ok(true);
        }

        public async Task<Response<PagedResult<UserResDto>>> GetAllUsers(int pageNumber = 1, int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var totalCount = await _context.Users.CountAsync();

            var users = await _context.Users
                .OrderBy(u => u.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserResDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email
                })
                .ToListAsync();

            var data = new PagedResult<UserResDto>
            {
                Items = users,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
            return Response<PagedResult<UserResDto>>.Ok(data);
        }

        public async Task<Response<UserProfileDto>> GetUserProfile(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new UserProfileDto
                {
                    Email = u.Email,
                    UserName = u.UserName,
                    AvatarUrl = u.AvatarUrl,
                    Bio = u.Bio
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return Response<UserProfileDto>.Fail("User was not found");
            }

            return Response<UserProfileDto>.Ok(user);
        }

        public async Task<Response<bool>> MakeAdmin(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return Response<bool>.Fail("User doesn't exist");
            }
            if (user.IsAdmin)
            {
                return Response<bool>.Fail("User is already an admin");
            }

            user.IsAdmin = true;
            await _context.SaveChangesAsync();
            return Response<bool>.Ok(true);
        }

        public async Task<Response<bool>> UpdateUserPassword(int userId, UpdatePasswordDto dto)
        {
            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
            {
                return Response<bool>.Fail("User not found");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, existingUser.PasswordHash);
            if (!isPasswordValid)
            {
                return Response<bool>.Fail("Incorrect password");
            }

            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Response<bool>.Ok(true);
        }

        public async Task<Response<UserResDto>> UpdateUserDeatail(int userId, UpdateUserDto dto)
        {
            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
            {
                return Response<UserResDto>.Fail("User not found");
            }

            existingUser.UserName = dto.UserName;
            existingUser.Bio = dto.Bio;
            await _context.SaveChangesAsync();

            var updatedUser = new UserResDto
            {
                Id = existingUser.Id,
                UserName = existingUser.UserName,
                Bio = existingUser.Bio,
                AvatarUrl = existingUser.AvatarUrl,
                Email = existingUser.Email
            };
            return Response<UserResDto>.Ok(updatedUser);
        }

        public async Task<Response<UserResDto>> UpdateUserAvatar(int userId, AvatarDto dto)
        {
            var existingUser = await _context.Users.FindAsync(userId);
            if (existingUser == null)
            {
                return Response<UserResDto>.Fail("User not found");
            }

            if (dto.Image == null || dto.Image.Length == 0)
            {
                return Response<UserResDto>.Fail("No image file provided");
            }

            var oldAvatarUrl = existingUser.AvatarUrl;

            var imageUrl = await _blobService.UploadImageAsync(dto.Image);
            existingUser.AvatarUrl = imageUrl;

            await _context.SaveChangesAsync();

            if (!string.IsNullOrWhiteSpace(oldAvatarUrl))
            {
                await _blobService.DeleteImageFile(oldAvatarUrl);
            }

            var updatedUser = new UserResDto
            {
                Id = existingUser.Id,
                UserName = existingUser.UserName,
                Bio = existingUser.Bio,
                Email = existingUser.Email,
                AvatarUrl = existingUser.AvatarUrl
            };

            return Response<UserResDto>.Ok(updatedUser);
        }

    }
}
