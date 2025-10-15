const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  const user = this;

  // Only hash the password if it's modified (or new)
  if (!user.isModified("password")) return next();

  // Generate salt and hash the password
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;

  next();
});

userSchema.static('matchPassword', async function(email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const salt = user.salt;
    const hashedPassword = user.password;
    
    // Fixed typo: "sh256" -> "sha256"
    // Fixed: using the input password parameter, not user.password
    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    // Fixed comparison logic
    if (hashedPassword !== userProvidedHash) {
      throw new Error("Incorrect password");
    }

    // Return user without salt and password
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.salt;
    
    return userObj;
  } catch (error) {
    throw error;
  }
});

const User = model("user", userSchema);
module.exports = User;