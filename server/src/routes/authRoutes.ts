import { Router } from "express";
import {
  getProfile,
  login,
  signup,
  updateProfile,
} from "../controllers/authControllers.js";
import { validate } from "../utils/validator.js";
import {
  validLogin,
  validSignup,
  validUpdateProfile,
} from "../validations/authValidations.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", validate(validSignup), signup);
router.post("/login", validate(validLogin), login);
router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  validate(validUpdateProfile),
  updateProfile,
);

export default router;
