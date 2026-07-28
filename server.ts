import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  accountFromDemoToken,
  createDemoToken,
  type DemoAccount,
} from "./src/data/demoAccounts.js";
import { INITIAL_DEVICES } from "./src/data/mockData.js";
import type { MedicalDevice } from "./src/types.js";

interface DemoRequest extends Request {
  demoUser?: DemoAccount;
}

interface DemoLoginRecord {
  id: number;
  username: string;
  full_name: string;
  role: string;
  login_time: string;
  login_count: number;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let demoDevices: MedicalDevice[] = clone(INITIAL_DEVICES);
let demoUsers: DemoAccount[] = clone(DEMO_ACCOUNTS);
let demoLogins: DemoLoginRecord[] = [];

export const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
  next();
});

function authenticateDemo(req: DemoRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const account = accountFromDemoToken(token);
  if (!account) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบด้วยบัญชีสาธิต" });
  }
  req.demoUser = account;
  next();
}

function requireDemoAdmin(req: DemoRequest, res: Response, next: NextFunction) {
  if (req.demoUser?.role !== "admin") {
    return res.status(403).json({ error: "สิทธิ์นี้ใช้ได้เฉพาะบัญชี demo_admin" });
  }
  next();
}

function sanitizeUsers(users: any[]): DemoAccount[] {
  return users.map((user) => ({
    username: String(user.username || ""),
    fullName: String(user.fullName || "Demo User"),
    role: user.role,
    profilePic: String(user.profilePic || ""),
  }));
}

const loginLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "กรุณารอสักครู่ก่อนทดลองเข้าสู่ระบบอีกครั้ง" },
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    mode: "portfolio_demo",
    persistence: "ephemeral_server_memory",
    database: "disabled",
    environmentVariablesRequired: false,
  });
});

app.post("/api/login", loginLimiter, (req, res) => {
  const username = String(req.body?.username || "").trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find(
    (candidate) => candidate.username.toLowerCase() === username,
  );

  if (!account || req.body?.password !== DEMO_PASSWORD) {
    return res.status(401).json({ error: "บัญชีหรือรหัสผ่านสาธิตไม่ถูกต้อง" });
  }

  const previous = demoLogins.find((record) => record.username === account.username);
  demoLogins = [
    {
      id: Date.now(),
      username: account.username,
      full_name: account.fullName,
      role: account.role,
      login_time: new Date().toISOString(),
      login_count: (previous?.login_count || 0) + 1,
    },
    ...demoLogins,
  ].slice(0, 100);

  res.json({
    ...account,
    token: createDemoToken(account),
    demo: true,
  });
});

app.get("/api/devices", authenticateDemo, (_req, res) => {
  res.json(clone(demoDevices));
});

app.post("/api/devices", authenticateDemo, (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "Expected an array of demo devices" });
  }
  demoDevices = clone(req.body);
  res.json({ success: true, simulated: true, persistence: "ephemeral_server_memory" });
});

app.put("/api/devices/:id", authenticateDemo, (req, res) => {
  const device = req.body as MedicalDevice;
  const index = demoDevices.findIndex((candidate) => candidate.id === req.params.id);
  if (index >= 0) demoDevices[index] = clone(device);
  else demoDevices.push(clone(device));
  res.json({ success: true, simulated: true, persistence: "ephemeral_server_memory" });
});

app.delete("/api/devices/:id", authenticateDemo, (req, res) => {
  demoDevices = demoDevices.filter((device) => device.id !== req.params.id);
  res.json({ success: true, simulated: true, persistence: "ephemeral_server_memory" });
});

app.get("/api/users", authenticateDemo, (req: DemoRequest, res) => {
  const visibleUsers = req.demoUser?.role === "admin"
    ? demoUsers
    : demoUsers.filter((user) => user.username === req.demoUser?.username);
  res.json(clone(visibleUsers));
});

app.post("/api/users", authenticateDemo, (req: DemoRequest, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: "Expected an array of demo users" });
  }

  const incomingUsers = sanitizeUsers(req.body);
  if (req.demoUser?.role === "admin") {
    demoUsers = incomingUsers;
  } else {
    const ownUpdate = incomingUsers.find(
      (user) => user.username === req.demoUser?.username,
    );
    if (ownUpdate) {
      demoUsers = demoUsers.map((user) => (
        user.username === ownUpdate.username ? ownUpdate : user
      ));
    }
  }

  res.json({ success: true, simulated: true, persistence: "ephemeral_server_memory" });
});

app.get(
  "/api/user-logins",
  authenticateDemo,
  requireDemoAdmin,
  (_req, res) => {
    res.json(clone(demoLogins));
  },
);

app.post("/api/demo/reset", authenticateDemo, (_req, res) => {
  demoDevices = clone(INITIAL_DEVICES);
  demoUsers = clone(DEMO_ACCOUNTS);
  demoLogins = [];
  res.json({ success: true, simulated: true });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Demo route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Demo API error", error);
  res.status(500).json({ error: "Demo request failed" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Portfolio demo running at http://localhost:${port}`);
  });
}

// Vercel imports the Express app through api/index.ts.
if (!process.env.VERCEL) {
  void startServer();
}
