import { Router } from "express";
import { authGuard } from "../middlewares/auth.middleware.js";
import { me, updateProfile, getAllUsers, deleteUser } from "../controllers/user.controller.js";
import { validateUpdateProfile } from "../validations/user.validation.js";

const router = Router();

router.get("/me", authGuard, me);
router.put("/me", authGuard, validateUpdateProfile, updateProfile);
router.get("/", /* authGuard, */ getAllUsers);
router.delete("/:id", authGuard, deleteUser);

export default router;
