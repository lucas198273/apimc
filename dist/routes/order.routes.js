"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderExport_controller_1 = require("../controllers/orderExport.controller");
const router = (0, express_1.Router)();
router.get("/export/pdf", orderExport_controller_1.exportOrdersPdf);
exports.default = router;
//# sourceMappingURL=order.routes.js.map