FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS runtime
WORKDIR /app

EXPOSE 5000
ENV ASPNETCORE_HTTP_PORTS=5000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "practice_dotnet.dll"]