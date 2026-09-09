import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface LavalinkNode {
  id: string;
  host: string;
  port: number;
  password: string;
  secure: boolean;
}

const NODES: LavalinkNode[] = [
  {
    id: "serenetia",
    host: "lavalinkv4.serenetia.com",
    port: 443,
    password: "https://seretia.link/discord",
    secure: true,
  },
];

async function pingNode(node: LavalinkNode): Promise<{ online: boolean; latencyMs: number | null; version: string | null }> {
  const protocol = node.secure ? "https" : "http";
  // /v4/info works on both nodes; /version returns 404 on some
  const url = `${protocol}://${node.host}:${node.port}/v4/info`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { Authorization: node.password },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { online: false, latencyMs: null, version: null };
    const json = await res.json() as { version?: { semver?: string } };
    const version = json?.version?.semver?.slice(0, 20) ?? null;
    return { online: true, latencyMs: Date.now() - start, version };
  } catch {
    return { online: false, latencyMs: null, version: null };
  }
}

router.get("/bot/status", async (_req, res) => {
  const results = await Promise.all(
    NODES.map(async (node) => {
      const ping = await pingNode(node);
      return { id: node.id, host: node.host, ...ping };
    })
  );

  res.json({
    botName: "Slither Music",
    commandCount: 99,
    nodes: results,
    checkedAt: new Date().toISOString(),
  });
});

export default router;
