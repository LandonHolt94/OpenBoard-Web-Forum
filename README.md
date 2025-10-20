# OpenBoard Web Forum

A simple forum web application built with Node.js, Express, MySQL, and JWT authentication.

---

## Table of Contents

1. [Project Setup](#project-setup)  
2. [Packages & Dependencies](#packages--dependencies)  
3. [Environment Variables](#environment-variables)  
4. [Database Setup](#database-setup)  
5. [Available Routes](#available-routes)  
6. [Testing the API](#testing-the-api)  

---

## Project Setup

1. Clone the repository:

```bash 
git clone https://github.com/LandonHolt94/OpenBoard-Web-Forum.git
cd OpenBoard-Web-Forum/backend
```
2. Install dependencies:

        npm install


3. Start the server:

        node src/server.js


The server will run on http://localhost:3000 (or the port specified in .env).
## Packages & Dependencies
[Packages & Dependencies]:

This project uses:

express – Web framework for Node.js

mysql2 – MySQL client with promise support

dotenv – Loads environment variables from .env

bcrypt – Password hashing

jsonwebtoken (JWT) – Authentication tokens

nodemon (optional, dev dependency) – Auto-restarts server during development

[Install all dependencies]:

          npm install express mysql2 dotenv bcrypt jsonwebtoken


Optional dev dependency:

          npm install --save-dev nodemon
  
## Environment Variables
Environment Variables

[Create a .env file in the backend folder]:

        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=password
        DB_NAME=openboard_db
        JWT_SECRET=your_super_secret_key
        PORT=3000


Make sure to replace DB_PASSWORD and JWT_SECRET with your own secure values.

## Database Setup
[Database Setup]

1. Start your MySQL server.

2. Create the database and tables:

            CREATE DATABASE openboard_db;

      USE openboard_db - This is the one Damian created (Found below this text). You can copy and paste it to mysql, run it to create the database.

        -- Users table
        CREATE TABLE users (
            UserID INT AUTO_INCREMENT PRIMARY KEY,
            Username VARCHAR(50) NOT NULL UNIQUE,
            Email VARCHAR(255) NOT NULL UNIQUE,
            PasswordHash VARCHAR(255) NOT NULL,
            Role VARCHAR(50) NOT NULL DEFAULT 'user',
            AccountCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Posts table
        CREATE TABLE posts (
            PostID INT AUTO_INCREMENT PRIMARY KEY,
            UserID INT NOT NULL,
            Title VARCHAR(255) NOT NULL,
            Body TEXT NOT NULL,
            HidePost BOOLEAN NOT NULL DEFAULT FALSE,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (UserID) REFERENCES users(UserID)
        );
        
        -- Comments table
        CREATE TABLE comments (
            CommentID INT AUTO_INCREMENT PRIMARY KEY,
            PostID INT NOT NULL,
            UserID INT NOT NULL,
            Body TEXT NOT NULL,
            HideComment BOOLEAN NOT NULL DEFAULT FALSE,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (PostID) REFERENCES posts(PostID),
            FOREIGN KEY (UserID) REFERENCES users(UserID)
        );
        
        -- Likes table
        CREATE TABLE likes (
            LikeID INT AUTO_INCREMENT PRIMARY KEY,
            PostID INT NOT NULL,
            UserID INT NOT NULL,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (PostID) REFERENCES posts(PostID),
            FOREIGN KEY (UserID) REFERENCES users(UserID),
            UNIQUE (PostID, UserID)
        );
        
        -- SurveyResponses table
        CREATE TABLE SurveyResponses (
            ResponseID INT AUTO_INCREMENT PRIMARY KEY,
            UserID INT NOT NULL,
            ResponseData TEXT NOT NULL,
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

Example image using Workbench:
<img width="1919" height="1138" alt="Screenshot 2025-10-19 172214" src="https://github.com/user-attachments/assets/d4e26306-f7a0-4b35-b6d5-2750f13057a7" />

Once you have created your database, To test it work properly you can run:
        SHOW DATABASES;
After you will see the openboard_db listed within Database! 

<img width="1919" height="1136" alt="Screenshot 2025-10-19 172539" src="https://github.com/user-attachments/assets/c1bccb78-dd74-4530-88d5-09a9f532eaa1" />

## Available Routes
[Available Routes]:

Public Routes

GET / – Test route, returns “Hello from the Open Web Board!”

To so this test to ensure API Endpoints can be accessed to do Change your directory to the src file.
the path is:

        CD backend
        CD src

Then type:

        node server.js

Then go to (http://localhost:3000/)
YOu should see:
<img width="1920" height="1200" alt="Screenshot (11)" src="https://github.com/user-attachments/assets/4133ce7d-6231-4847-bb2c-83257c2d4d20" />


POST /register – Register a new user (Using POSTMAN further inforation is in Testin the API)

POST /login – Login and receive a JWT (Using POSTMAN further inforation is in Testin the API)

Protected Routes (future/Not currently implemented)

POST /posts – Create a new post (requires JWT) (Using POSTMAN further inforation is in Testin the API)

POST /comments – Comment on a post (requires JWT) (Using POSTMAN further inforation is in Testin the API)

## Testing the API
[Testing the API]:

Use Postman or Insomnia to test endpoints:
(I Used Postman) - Once isntalled:

Register a user
Set to POST/ ADD localhost:
POST http://localhost:3000/register

Change Content-Type:
Content-Type: application/json

Select Body and make sure RAW is checked.
Within the text window add:

Register a user:
{
  "username": "exampleuser",
  "email": "example@email.com",
  "password": "password123"
}

You can repeat the steps above in a new tab and test Login a user.
Select Body and make sure RAW is checked.
Within the text window add:

Login a user:
POST http://localhost:3000/login
Content-Type: application/json

{
  "email": "example@email.com",
  "password": "password123"
}

Example image:
<img width="1916" height="1140" alt="Postman Example" src="https://github.com/user-attachments/assets/4bd95846-ef37-416e-b2e3-ff8fd748d5c7" />


Copy the returned token for any authenticated requests.

[Tips for Teammates]

-- Always use unique usernames and emails when testing /register to avoid conflicts.

-- For authenticated routes, include the JWT in the Authorization header:

--Authorization: Bearer <YOUR_JWT_TOKEN>

[Troubleshoot]
!!! Issues I Encountered !!!
If the server doesn't start, check:

.env file exists in the backend folder

MySQL server is running

Database name matches DB_NAME in .env

Use nodemon src/server.js for automatic server reload during development.
