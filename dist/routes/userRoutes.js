"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/userRoutes.ts
const express_1 = __importDefault(require("express"));
const requireAuth_1 = require("../middleware/requireAuth");
const router = express_1.default.Router();
router.get("/perfil", requireAuth_1.requireAuth, (req, res) => {
    // req.user contém usuário autenticado do Supabase
    res.json({ user: req.user });
});
exports.default = router;
//# sourceMappingURL=userRoutes.js.map