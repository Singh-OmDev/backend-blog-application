const express = require("express");
const path = require("path");
const fs = require("fs"); // Add this line
const userRoute = require('./routes/user');
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/blogify")
    .then((e) => console.log("MongoDB connected"));

app.set("view engine", "ejs");
const viewsPath = path.resolve('./views');
app.set("views", viewsPath);

// Debug: List all files in views directory
console.log("Views directory path:", viewsPath);
try {
    const files = fs.readdirSync(viewsPath);
    console.log("Files in views directory:", files);
    
    // Check if specific files exist
    console.log("signin.ejs exists:", fs.existsSync(path.join(viewsPath, 'signin.ejs')));
    console.log("signup.ejs exists:", fs.existsSync(path.join(viewsPath, 'signup.ejs')));
    console.log("home.ejs exists:", fs.existsSync(path.join(viewsPath, 'home.ejs')));
} catch (err) {
    console.log("Error reading views directory:", err.message);
}

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/user", userRoute);

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));