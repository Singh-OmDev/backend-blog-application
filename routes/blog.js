const {Router} = require('express');
const router = Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs'); 
const Blog = require("../models/blog");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userUploadDir = `./public/uploads/${req.user._id}`;
        
        if (!fs.existsSync(userUploadDir)) {
            fs.mkdirSync(userUploadDir, { recursive: true });
        }
        
        cb(null, userUploadDir);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
    });
});  

router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, body } = req.body;
        
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`
        });
        
        return res.redirect("/"); // ✅ FIXED: Redirect to home instead of non-existent blog page
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.redirect("/blog/add-new");
    }
});  

module.exports = router;