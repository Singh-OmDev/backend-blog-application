const express = require("express");
const path = require("path");
const fs = require("fs");
const userRoute = require('./routes/user');
const mongoose = require("mongoose");
const blogRoute = require('./routes/blog');
const Blog = require("./models/blog");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = 3000;

app.use(express.static(path.resolve("./public")));

mongoose.connect("mongodb://127.0.0.1:27017/blogify")
    .then((e) => console.log("MongoDB connected"));

app.set("view engine", "ejs");  
const viewsPath = path.resolve('./views');
app.set("views", viewsPath);

console.log("Views directory path:", viewsPath);
try {
    const files = fs.readdirSync(viewsPath);
    console.log("Files in views directory:", files);
    
    console.log("signin.ejs exists:", fs.existsSync(path.join(viewsPath, 'signin.ejs')));
    console.log("signup.ejs exists:", fs.existsSync(path.join(viewsPath, 'signup.ejs')));
    console.log("home.ejs exists:", fs.existsSync(path.join(viewsPath, 'home.ejs')));
} catch (err) {
    console.log("Error reading views directory:", err.message);
}

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    
    res.render("home", {
        user: req.user,
        blogs: allBlogs
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));