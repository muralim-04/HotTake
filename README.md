# 🔥 HotTake

> A decoupled, full-stack social media web application built with **ASP.NET Core**, **React**, and **PostgreSQL**.

HotTake is a modern social media platform where users can share thoughts, interact with posts, and connect with other users. The application follows a **decoupled client-server architecture**, separating a RESTful backend API from a reactive, strongly typed frontend.

---

## ✨ Features

* 🔐 **Secure Authentication**

  * JWT-based authentication
  * Access and refresh tokens
  * BCrypt password hashing

* 📝 **Content & Engagement**

  * Full CRUD operations for posts
  * Comment threads
  * Post likes
  * User profiles

* 🖼️ **Media Management**

  * User avatar uploads
  * Image uploads
  * Blob Storage integration

* ⚡ **Optimized State Management**

  * Zustand for global client state
  * TanStack Query for server-state management and caching

* 🛡️ **Standardized Error Handling**

  * Global exception-handling middleware
  * Axios response interceptors
  * RFC 7807 Problem Details

* 🐳 **Containerized Infrastructure**

  * Dockerized frontend
  * Dockerized backend
  * PostgreSQL container
  * Docker Compose orchestration
  * Nginx for serving the production frontend

---

## 🏗️ Architecture

The application is split into three main components:

```text
┌─────────────────────┐
│     React Client    │
│  TypeScript + Vite  │
└──────────┬──────────┘
           │ HTTP / REST
           ▼
┌─────────────────────┐
│   ASP.NET Core API  │
│   C# + EF Core      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│     PostgreSQL      │
└─────────────────────┘

        │
        ▼
┌─────────────────────┐
│    Blob Storage     │
│  Images / Avatars   │
└─────────────────────┘
```

The frontend communicates with the backend exclusively through the REST API, keeping the two applications independently deployable.

---

## 🛠️ Tech Stack

| Layer              | Technologies                                                          |
| ------------------ | --------------------------------------------------------------------- |
| **Frontend**       | React, TypeScript, Vite, Zustand, TanStack Query, Tailwind CSS, Axios |
| **Backend**        | C#, ASP.NET Core Web API, .NET 7, Entity Framework Core               |
| **Database**       | PostgreSQL                                                            |
| **Storage**        | Blob Storage                                                          |
| **Infrastructure** | Docker, Docker Compose, Nginx                                         |
| **Testing**        | xUnit, FluentAssertions, FakeItEasy                                   |

---

## 📂 Project Structure

```text
HotTake/
├── client/                       # React / TypeScript frontend
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── features/             # Feature-based modules
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── post/
│   │   │   └── user/
│   │   ├── lib/                  # Shared configurations and utilities
│   │   ├── services/             # API abstraction layer
│   │   └── stores/               # Zustand stores
│   ├── Dockerfile
│   └── vite.config.ts
│
├── server/                       # ASP.NET Core backend
│   ├── Controllers/              # API endpoints
│   ├── Data/                     # EF Core DbContext
│   ├── DTOs/                     # API data transfer objects
│   ├── Entities/                 # Database entities
│   ├── Middleware/               # Custom middleware
│   ├── Services/                 # Business logic
│   └── Dockerfile
│
├── docker-compose.yaml           # Container orchestration
├── .env.example                  # Environment variable template
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

The easiest way to run HotTake is with Docker.

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Alternatively:

  * Node.js 18+
  * .NET SDK 7.0+
  * PostgreSQL

---

### 🐳 Option 1 — Docker Compose

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/HotTake.git
cd HotTake
```

#### 2. Configure environment variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Update the values according to your environment.

#### 3. Start the application

```bash
docker compose up -d --build
```

#### 4. Access the application

| Service        | URL                             |
| -------------- | ------------------------------- |
| 🌐 Frontend    | `http://localhost:3000`         |
| 📚 Swagger API | `http://localhost:5000/swagger` |

> The actual ports may differ depending on your Docker/Nginx configuration.

---

## 💻 Option 2 — Local Development

### Backend

Navigate to the server directory:

```bash
cd server
```

Configure your PostgreSQL connection string in `appsettings.json`.

Apply the database migrations:

```bash
dotnet ef database update
```

Start the API:

```bash
dotnet run
```

---

### Frontend

Navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

---

## 🧪 Testing

The backend uses:

* **xUnit** — test framework
* **FluentAssertions** — readable assertions
* **FakeItEasy** — mocking

Run the backend tests with:

```bash
dotnet test
```

---

## 🔒 Authentication Flow

HotTake uses a JWT-based authentication system with separate **access** and **refresh tokens**.

```text
User
 │
 │ Login
 ▼
ASP.NET Core API
 │
 ├── Validate credentials
 ├── Verify BCrypt password
 └── Generate tokens
       │
       ▼
   Access Token
   Refresh Token
```

The refresh-token mechanism allows users to obtain new access tokens without having to authenticate again.

---

## 🛡️ Error Handling

The API follows **RFC 7807 Problem Details** for consistent error responses.

The backend uses global exception-handling middleware, while the frontend uses Axios interceptors to centrally process API errors.

Example response:

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "The submitted data is invalid."
}
```

---

## 📦 Docker

The project is fully containerized using Docker Compose.

```text
                 Docker Compose
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   ┌────────┐     ┌────────┐     ┌──────────┐
   │ Client │────▶│   API  │────▶│PostgreSQL│
   │ Nginx  │     │ .NET   │     │          │
   └────────┘     └────────┘     └──────────┘
```

This provides a consistent development and deployment environment across machines.

---

## 📜 License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for details.
