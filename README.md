# Express Chat application sample project

## Description
Simple chat application demo using node,express,ejs,sequelize-ORM,mysql.

## Installation

```bash
$ npm install
$ npx sequelize-cli db:migrate //To migrate user table
```

# Sequlize-ORM
-First go to config folder and open config.json file.
-Add your database credentials in this code below:
"development": {
    "username": "root", //Your username
    "password": null, //Password if any
    "database": "chatApplication", //Database name
    "host": "127.0.0.1", //Your host name
    "dialect": "mysql", 
    "logging":false //Remove this option if you want to log queries running in background
  },

## Running the app

```bash
# Start the server
$ npm run dev

```
Project will start on port 4000 on localhost (http://localhost:4000).

## Test
No tests included this time. Just playing around with the framework.

## How to use for multiple user
As the project is running on localhost open any browser with normal and incognito tabs.
Login with different ids on both tabs.

## Functionality
The project contain for functionality as given below.

-Login & Registration for users.
-User status changes to green on login and red on disconnection.
-Select and chat with online users only.
-No user logout button but on tab close user will be logged out.
-Make user offline on disconnection.

## signUp
To create user you need to pass email,name,password in body of API (http://localhost:4000/register).
Multiple user can not be created with same email.

## login
For login you need to pass email and password in body of API (http://localhost:4000/login).

## Load chat history
Select any user from the list and chat history will load

## Send Message
Type message to the selected user and message will be sent.



