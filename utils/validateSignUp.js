var validator = require("validator");

const validateSignUp = (firstName, lastName, email, password) => {
  if (!firstName || !lastName) {
    throw new Error("First and Last Name is required");
  } else if (firstName.length < 3 || firstName.length > 15) {
    throw new Error("first name shloud be greater than 4 and less than 16");
  } else if (!validator.isEmail(email)) {
    throw new Error("enter valid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("enter strong password");
  }
};
module.exports = validateSignUp;
