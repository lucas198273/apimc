import { Router } from "express";
import { exportOrdersPdf } from "../controllers/orderExport.controller";

const router = Router();

router.get("/export/pdf", exportOrdersPdf);

export default router;
