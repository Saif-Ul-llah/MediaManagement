const Joi = require("joi");
const { registerUser, loginUser, upgradeUser } = require("../utils/auth");

const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("admin", "crown", "user").required(),
});

const SignUp = async (req, res) => {
  const { username, email, password, role } = req.body;

  const { error } = userSchema.validate({ username, email, password, role });

  if (error) {
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message });
  }

  try {
    const register = await registerUser({ username, email, password, role });
    res.status(200).send({ success: true, ...register });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

const SignIn = async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate({ email, password });

  if (error) {
    return res
      .status(400)
      .send({ success: false, message: error.details[0].message });
  }

  try {
    const login = await loginUser({ email, password });
    res.status(200).send({ success: true, ...login });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};

const UpgradeAccount = async (req, res) => {
    const userId = req.user._id; // Get user ID from the request object
  
    if (!userId) {
      return res
        .status(400)
        .send({ success: false, message: "please provide userID" });
    }
  
    try {
      const upgraded = await upgradeUser(userId); // Pass the user ID to the upgrade function
      res.status(200).send({ success: true, ...upgraded });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  };
  

module.exports = { SignUp, SignIn ,UpgradeAccount};
