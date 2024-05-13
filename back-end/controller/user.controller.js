const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const errorHandler = require("../utils/error");

const updateUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.id !== req.params.id) {
      return next(
        errorHandler(403, "You are not authorized to update this account")
      );
    }

    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

module.exports = { updateUser };
