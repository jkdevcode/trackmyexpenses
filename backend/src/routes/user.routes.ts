import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware.js";
import { me, updateProfile } from "../controllers/user.controller.js";
import { validateUpdateProfile } from "../validations/user.validation.js";

const router = Router();

router.get("/me", authGuard, me);
router.put("/me", authGuard, validateUpdateProfile, updateProfile);

export default router;
