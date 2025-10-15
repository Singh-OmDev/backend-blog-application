const { Router } = require('express');
const router = Router();
const User = require("../models/user");

router.get("/signin", (req, res) => {
    return res.render("signin");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.post("/signin", async (req, res) => {
    try {
        console.log("=== SIGNIN ATTEMPT ===");
        console.log("Request body:", req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log("Missing email or password");
            return res.render("signin", { error: "Email and password are required" });
        }

        console.log("Looking for user with email:", email);
        const user = await User.matchPassword(email, password);
        console.log("User authenticated successfully:", user);
        
        return res.redirect("/");
    } catch (error) {
        console.log("=== SIGNIN ERROR ===");
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        return res.render("signin", { error: error.message });
    }
});

router.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    await User.create({
        fullName,
        email,
        password,
    });
    return res.redirect("/");
});

module.exports = router;