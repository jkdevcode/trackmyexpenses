const { Router } = require("express");
const { register, login } = require("../controllers/auth.controller");

const router = Router();
router.post("/register", register);
router.post("/login", login);

module.exports = { router };
