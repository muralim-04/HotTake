using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using practice_dotnet.Data;
using practice_dotnet.DTOs;
using practice_dotnet.Entities;
using practice_dotnet.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace practice_dotnet.Services.AuthService
{
    
    public class AuthService : IAuthService
    {
        private readonly DataContext _context;
        private readonly IConfiguration _config;
        public AuthService(DataContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<Response<AuthResultDto>> LogIn(LogInDto user)
        {
            var existingUser = await _context.Users
                .Include(u => u.RefreshToken)
                .FirstOrDefaultAsync(u => u.Email == user.Email);

            if (existingUser == null)
            {
                return Response<AuthResultDto>.Fail("User with this email doesn't exist");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(user.Password, existingUser.PasswordHash);
            if (!isPasswordValid)
            {
                return Response<AuthResultDto>.Fail("Incorrect password");
            }

            var refreshToken = GenerateRefreshToken();
            var tokenHash = HashToken(refreshToken);

            if (existingUser.RefreshToken == null)
            {
                existingUser.RefreshToken = new RefreshToken
                {
                    TokenHash = tokenHash,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                    IsRevoked = false
                };
            }
            else
            {
                existingUser.RefreshToken.TokenHash = tokenHash;
                existingUser.RefreshToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
                existingUser.RefreshToken.IsRevoked = false;
            }
            await _context.SaveChangesAsync();

            var token = GenerateAccessToken(existingUser);

            var response = new AuthResultDto
            {
                Id = existingUser.Id,
                UserName = existingUser.UserName,
                IsAdmin = existingUser.IsAdmin,
                Email = existingUser.Email, 
                AccessToken = token,
                RefreshToken = refreshToken
            };
            return Response<AuthResultDto>.Ok(response);
        }
        public async Task<Response<AuthResultDto>> Register(UserReqDto user)
        {
            var userExist = await _context.Users.FirstOrDefaultAsync(u => u.Email == user.Email);

            if (userExist != null)
            {
                return Response<AuthResultDto>.Fail("User already exist");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            var refreshToken = GenerateRefreshToken();
            var hashedToken = HashToken(refreshToken);

            var newUser = new User
            {
                Email = user.Email,
                PasswordHash = hashedPassword,
                UserName = user.UserName,
            };
            newUser.RefreshToken = new RefreshToken
            {
                TokenHash = hashedToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7)
            };

            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();

            var token = GenerateAccessToken(newUser);

            var response = new AuthResultDto
            {
                Id = newUser.Id,
                UserName = newUser.UserName,
                IsAdmin = newUser.IsAdmin,
                Email = newUser.Email,
                AccessToken = token,
                RefreshToken = refreshToken
            };

            return Response<AuthResultDto>.Ok(response);
        }
        public async Task<Response<AuthResultDto>> RefreshToken(string rawRefreshToken)
        {
            var tokenHash = HashToken(rawRefreshToken);

            var storedToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

            if (storedToken == null)
            {
                return Response<AuthResultDto>.Fail("Invalid refresh token");
            }

            if (storedToken.IsRevoked)
            {
                return Response<AuthResultDto>.Fail("Refresh token has been revoked");
            }

            if (storedToken.ExpiresAt < DateTime.UtcNow)
            {
                return Response<AuthResultDto>.Fail("Refresh token has expired, login again");
            }

            var newRawRefreshToken = GenerateRefreshToken();
            var newHashedToken = HashToken(newRawRefreshToken);

            storedToken.TokenHash = newHashedToken;
            storedToken.ExpiresAt = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();

            var newAccessToken = GenerateAccessToken(storedToken.User);

            var response = new AuthResultDto
            {
                Id = storedToken.User.Id,
                UserName = storedToken.User.UserName,
                IsAdmin = storedToken.User.IsAdmin,
                Email = storedToken.User.Email,
                AccessToken = newAccessToken,
                RefreshToken = newRawRefreshToken
            };

            return Response<AuthResultDto>.Ok(response);
        }
        public async Task<Response<bool>> LogOut(int userId)
        {
            var existingUser = await _context.Users
                .Include(u => u.RefreshToken)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (existingUser == null)
            {
                return Response<bool>.Fail("User with this id doesn't exist");
            }

            if(existingUser.RefreshToken != null)
{
                _context.Set<RefreshToken>().Remove(existingUser.RefreshToken);
            }

            await _context.SaveChangesAsync();
                
            return Response<bool>.Ok(true);
        }
        private string GenerateAccessToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
            };

            // Turn your secret key string into a byte array & cryptographic key
            var secretKey = _config["JwtSettings:SecretKey"]!;
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            // Define the Signing Credentials (Algorithm + Key)
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["JwtSettings:Issuer"],
                audience: _config["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials 
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private string GenerateRefreshToken()
        {
            return Convert.ToHexString(RandomNumberGenerator.GetBytes(40));
        }
        private string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }

    }
}
