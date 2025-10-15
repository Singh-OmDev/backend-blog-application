const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto");
const { createTokenForUser } = require("../services/authentication");

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

userSchema.statics.matchPasswordAndGenerateToken = async function(email, password) {
  try {
    console.log("🔍 Finding user with email:", email);
    const user = await this.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found");
      throw new Error("User not found");
    }

    console.log("🔑 Verifying password...");
    const salt = user.salt;
    const hashedPassword = user.password;
    
    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    console.log("Stored hash:", hashedPassword);
    console.log("Provided hash:", userProvidedHash);

    if (hashedPassword !== userProvidedHash) {
      console.log("❌ Password incorrect");
      throw new Error("Incorrect password");
    }

    console.log("✅ Password correct, generating token...");
    const token = createTokenForUser(user);
    console.log("🎫 Token generated");
    
    return token;
    
  } catch (error) {
    console.log("💥 Error in authentication:", error.message);
    throw error;
  }
};

const User = model("user", userSchema);
module.exports = User;