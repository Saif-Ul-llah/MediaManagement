const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({ id, role }) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Register User
const registerUser = async ({ username, email, password, role }) => {
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    const user = await User.create({ username, email, password, role });

    return {
      message: "User Registered Successfully",
    };
  } catch (error) {
    console.log(error);
    
    throw new Error(error.message || "Error registering user");
  }
};

// Login User
const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken({ id: user._id, role: user.role }),
      };
    } else {
      return { message: "Invalid credentials" };
    }
  } catch (error) {
    console.log(error);
    
    return { message: "Error logging in" };
  }
};

// Upgrade User to Crown
const upgradeUser = async ({ _id }) => {
  try {
    const user = await User.findById(_id);

    if (user.role === "user") {
      user.role = "crown";
      user.storageLimit = 50 * 1024 * 1024;
      await user.save();
      let token = generateToken({ id: user._id, role: user.role });

      return { message: "User upgraded to Crown", token };
    } else {
      return { message: "User is already a Crown user" };
    }
  } catch (error) {
    console.log(error);
    
    return { message: "Error upgrading user" };
  }
};

module.exports = { registerUser, loginUser, upgradeUser };
