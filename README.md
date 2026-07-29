# AI-Powered Technical Interview Platform - Backend

## 📌 Overview

This repository contains the backend of the **AI-Powered Technical Interview Platform** developed using **Java Spring Boot**. It provides secure authentication, RESTful APIs, AI integration, interview management, and database operations.

---

## 🚀 Features

- 🔐 User Registration & Login
- 🛡️ JWT Authentication
- 👤 Role-Based Authorization
- 💻 Technical Interview Management
- 🤖 AI-Powered Question Generation
- 📝 AI Feedback Generation
- 📊 Interview History Management
- 🌐 RESTful APIs
- 🗄️ MySQL Database Integration

---

## 🛠️ Tech Stack

### Programming Language

- Java

### Frameworks

- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate

### Database

- MySQL

### Build Tool

- Maven

### AI Integration

- OpenRouter API

---

## 📂 Project Structure

```text
src
├── main
│   ├── java
│   │   ├── controller
│   │   ├── service
│   │   ├── repository
│   │   ├── entity
│   │   ├── dto
│   │   ├── config
│   │   ├── security
│   │   ├── util
│   │   └── exception
│   └── resources
│       ├── application.properties
│       └── static
└── test
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/pritamcodinghere-hash/YOUR_BACKEND_REPOSITORY.git
```

### Move into the Project

```bash
cd YOUR_BACKEND_REPOSITORY
```

### Configure Database

Update your **application.properties**

```properties
spring.datasource.url=YOUR_DATABASE_URL
spring.datasource.username=YOUR_DATABASE_USERNAME
spring.datasource.password=YOUR_DATABASE_PASSWORD

jwt.secret=YOUR_SECRET_KEY

openrouter.api.key=YOUR_OPENROUTER_API_KEY
```

> **Note:** Never upload your real database password, JWT secret, or API key to GitHub.

---

### Build the Project

```bash
mvn clean install
```

---

### Run the Application

```bash
mvn spring-boot:run
```

The backend runs on

```text
http://localhost:8080
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register User |
| POST | /api/auth/login | Login User |

### Interview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/interviews | Get Interview History |
| POST | /api/interviews | Start New Interview |
| DELETE | /api/interviews/{id} | Delete Interview |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/generate-question | Generate Interview Question |
| POST | /api/ai/evaluate-answer | Evaluate User Answer |
| POST | /api/ai/code-review | AI Code Review |

---

## 🔒 Security

- JWT Authentication
- BCrypt Password Encryption
- Spring Security
- Protected REST APIs
- Role-Based Authorization

---

## 🚀 Future Improvements

- 🎤 Voice-Based AI Interview
- 🎥 Live Video Interview
- 📄 Resume Analysis
- 📊 Admin Dashboard
- 🔔 Email Notifications
- ☁️ Cloud Deployment

---

## 👨‍💻 Author

**Pritam Singh**

GitHub:
https://github.com/pritamcodinghere-hash



---

⭐ If you found this project useful, consider giving it a star!
