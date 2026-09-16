using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace practice_dotnet.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedPostEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Score",
                table: "UserPosts");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "UserPosts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Score",
                table: "UserPosts",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "UserPosts",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
