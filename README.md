Steam-Style AI Game Recommendation Platform
Project Overview

This project is a full-stack web application inspired by Steam.
It allows users to:

Register and authenticate securely

Manage their personal game library

Receive AI-based game recommendations

Store and retrieve data from a cloud database

The system implements a hybrid AI architecture:

Primary recommendation via GPT (OpenAI API)

Automatic fallback to an internal rule-based engine if the external API fails

Features

JWT Authentication (Register / Login)

Password hashing with bcrypt

User profile management

Full CRUD for games

MongoDB Atlas cloud database

Hybrid AI Recommendation Engine

Steam-inspired dark UI

Environment variable configuration

Secure backend architecture


AI Recommendation System

The AI recommendation works in two stages:

The system attempts to analyze user preferences using GPT.

If GPT is unavailable (e.g., quota exceeded), it automatically switches to a local genre-matching engine.

This guarantees system reliability.

Example response:

{
  "aiMode": "local",
  "detectedGenre": "Shooter",
  "reason": "Recommendation generated using local AI engine.",
  "games": [...]
}




Project Structure:
steam-project/
│
├── client/               # Frontend (HTML, CSS, JS)
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── app.js
│
├── seedGames.js          # Database seed script
├── server.js
├── package.json
├── .gitignore
└── README.md



Tech Stack
Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

JWT

bcrypt

OpenAI API

Frontend

HTML

CSS

Vanilla JavaScript



⚙ Installation & Setup
1️ Clone repository
git clone https://github.com/YOUR_USERNAME/steam-project.git
cd steam-project

2️ Install dependencies
npm install

3️ Create .env file
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
OPENAI_API_KEY=your_openai_key (optional)

4️ Seed database (optional)
node seedGames.js

5️ Run project
npm run dev


Open in browser:

http://localhost:5000




API Endpoints
Authentication

POST /api/auth/register

POST /api/auth/login

User

GET /api/users/profile

PUT /api/users/profile

Games

POST /api/games

GET /api/games

GET /api/games/:id

PUT /api/games/:id

DELETE /api/games/:id

AI

POST /api/ai/recommend

🗄 Database Schema
User

username

email

password (hashed)

role (optional)

Game

title

genre

type

price

iconUrl

owner




<img width="1495" height="874" alt="image" src="https://github.com/user-attachments/assets/8aa84f35-1837-4512-a8de-af4f53533959" />

<img width="1567" height="905" alt="image" src="https://github.com/user-attachments/assets/624aeb56-8d0b-4595-8ed7-5c2976d9342d" />

<img width="1428" height="802" alt="image" src="https://github.com/user-attachments/assets/a71dc976-d922-4adb-9a94-2f868b9e7306" />

Authors:
Zhandaulet Ermekov , Alan Kissamenov
