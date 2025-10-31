"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/authRoutes.ts
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const router = express_1.default.Router();
/* ---------------------- LOGIN ---------------------- */
router.post("/login", async (req, res) => {
    const { username, senha } = req.body;
    try {
        const result = await (0, authService_1.loginUsuario)(username, senha);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
/* ---------------------- REGISTRO ---------------------- */
exports.default = router;
//# sourceMappingURL=authRoutes.js.map