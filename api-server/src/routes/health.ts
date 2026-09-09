import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Root health check — hit by the deployment healthcheck at GET /api
router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// Named health endpoint
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
