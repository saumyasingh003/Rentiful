import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createApplication, listApplications, updateApplicationStatus } from "../controllers/applicationControllers.js";
const router = express.Router();
router.post("/", authMiddleware(["tenant"]), createApplication);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);
router.get("/", authMiddleware(["manager", "tenant"]), listApplications);
export default router;
//# sourceMappingURL=applicationRoutes.js.map