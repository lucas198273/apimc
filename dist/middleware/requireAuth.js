"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const verififySupabaseToken_1 = require("../lib/verififySupabaseToken");
async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token de autenticação ausente." });
        }
        const token = authHeader.replace("Bearer ", "").trim();
        const user = await (0, verififySupabaseToken_1.verifySupabaseToken)(token);
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: err.message });
    }
}
//# sourceMappingURL=requireAuth.js.map