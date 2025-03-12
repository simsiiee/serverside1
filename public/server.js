// server.js

// Import necessary modules
const express = require('express'); // Express.js for creating the server
const bodyParser = require('body-parser'); // Body-parser to handle request bodies
const fs = require('fs'); // File system module to work with files
const path = require('path'); // Path module for file path utilities

const app = express(); // Create an Express application
const port = 3000; // Define the port number for the server to listen on

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // To parse JSON bodies

// Serve static files from the 'public' directory
// This makes files in the 'public' folder accessible directly from the browser
app.use(express.static(path.join(__dirname, 'public')));

// User data storage - in a real application, use a database
const usersFilePath = path.join(__dirname, 'users.json');

// Function to read users from users.json file
const readUsers = () => {
    try {
        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        // If the file doesn't exist or is empty/invalid JSON, return an empty array
        return [];
    }
};

// Function to write users to users.json file
const writeUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Signup endpoint - handles POST requests to /signup
app.post('/signup', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request body

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with 400 error if fields are missing
    }

    const users = readUsers(); // Read existing users from the file
    const existingUser = users.find(user => user.email === email); // Check if user with the email already exists

    if (existingUser) {
        return res.status(409).send('Email already registered.'); // Respond with 409 conflict if email is already registered
    }

    // Create a new user object with email, password, and a timestamp
    const newUser = {
        email: email,
        password: password, // In a real app, hash the password before storing
        timestamp: new Date().toISOString() // Add a timestamp for when the user signed up
    };

    users.push(newUser); // Add the new user to the users array
    writeUsers(users); // Write the updated users array back to users.json

    console.log(`User signed up: ${email}`); // Log signup action on the server
    res.send('Signup successful!'); // Respond to the client with a success message
});

// Login endpoint - handles POST requests to /login
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Extract email and password from the request

    if (!email || !password) {
        return res.status(400).send('Email and password are required.'); // Respond with 400 error if fields are missing
    }

    const users = readUsers(); // Read users from users.json
    const user = users.find(user => user.email === email); // Find user by email

    if (!user) {
        return res.status(401).send('Invalid email or password.'); // 401 Unauthorized if email not found
    }

    if (user.password !== password) { // In real app, compare hashed passwords
        return res.status(401).send('Invalid email or password.'); // 401 Unauthorized if password doesn't match
    }

    console.log(`User logged in: ${email}`); // Log login action on the server
    res.send('Login successful!'); // Respond with success message
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); // Log message when server starts
});
