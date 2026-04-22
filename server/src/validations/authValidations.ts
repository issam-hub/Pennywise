import { body } from "express-validator";

export const validSignup = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().notEmpty().withMessage("email is required"),
  body("password").trim().notEmpty().withMessage("password is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("password must be between 8 and 16 characters")
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password must at least include one uppercase letter, one lowercase letter, one number and one symbol",
    ),
];

export const validLogin = [
  body("email").trim().notEmpty().withMessage("email is required"),
  body("password").trim().notEmpty().withMessage("password is required"),
  body("email").isEmail().withMessage("email must be valid"),
  body("password")
    .isLength({ min: 8, max: 16 })
    .withMessage("password must be between 8 and 16 characters")
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "password must at least include one uppercase letter, one lowercase letter, one number and one symbol",
    ),
];

export const validUpdateProfile = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().notEmpty().withMessage("email is required"),
  body("email").isEmail().withMessage("email must be valid"),
];
