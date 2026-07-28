import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";

dotenv.config();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret;
}

// JWT-like stateless token generation
function generateToken(payload: { username: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({ 
    ...payload, 
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h expiry
  })).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${header}.${claims}`)
    .digest("base64url");
    
  return `${header}.${claims}.${signature}`;
}

function verifyToken(token: string): { username: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, claims, signature] = parts;
    
    const expectedSignature = crypto
      .createHmac("sha256", getJwtSecret())
      .update(`${header}.${claims}`)
      .digest("base64url");
      
    const providedSignature = Buffer.from(signature);
    const computedSignature = Buffer.from(expectedSignature);
    if (
      providedSignature.length !== computedSignature.length
      || !crypto.timingSafeEqual(providedSignature, computedSignature)
    ) {
      return null;
    }
    
    const parsedClaims = JSON.parse(Buffer.from(claims, "base64url").toString("utf8"));
    const allowedRoles = ["admin", "registration", "reporting", "ipm", "repair"];
    if (
      typeof parsedClaims.username !== "string"
      || !allowedRoles.includes(parsedClaims.role)
      || typeof parsedClaims.exp !== "number"
      || parsedClaims.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    
    return {
      username: parsedClaims.username,
      role: parsedClaims.role
    };
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "เซสชันหมดอายุหรือไม่มีผล กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
  }
  
  req.user = decoded;
  next();
}

// Authorization Helper
function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
    }
    if (req.user.role === "admin" || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้" });
  };
}

// Role-based Device Transition Verification
function canUserModifyDevice(role: string, existing: any, incoming: any): boolean {
  if (role === "admin") return true;
  
  const existingStep = existing ? (existing.workflowStep || 1) : null;
  
  // If creating a brand new device, require 'registration' or 'admin'
  if (!existing) {
    return role === "registration";
  }
  
  // Rule checking based on current step of the device
  if (existingStep === 1) {
    return role === "registration";
  }
  if (existingStep === 2) {
    return role === "ipm";
  }
  if (existingStep === 3) {
    return role === "repair";
  }
  if (existingStep === 4) {
    return role === "reporting";
  }
  
  return false;
}


const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || "";
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD?.trim() || "";

function assertBootstrapPasswords(): void {
  if (!ADMIN_PASSWORD || !DEFAULT_USER_PASSWORD) {
    throw new Error(
      "ADMIN_PASSWORD and DEFAULT_USER_PASSWORD are required when creating the initial users."
    );
  }
}

const DEFAULT_USERS = [
  { username: "demo_admin", fullName: "ผู้ดูแลระบบสาธิต", role: "admin", password: ADMIN_PASSWORD, profilePic: "" },
  { username: "demo_registration", fullName: "เจ้าหน้าที่ลงทะเบียนสาธิต", role: "registration", password: DEFAULT_USER_PASSWORD, profilePic: "" },
  { username: "demo_ipm", fullName: "เจ้าหน้าที่ IPM สาธิต", role: "ipm", password: DEFAULT_USER_PASSWORD, profilePic: "" },
  { username: "demo_repair", fullName: "ช่างซ่อมบำรุงสาธิต", role: "repair", password: DEFAULT_USER_PASSWORD, profilePic: "" },
  { username: "demo_reporting", fullName: "เจ้าหน้าที่รายงานผลสาธิต", role: "reporting", password: DEFAULT_USER_PASSWORD, profilePic: "" }
];

interface UserLoginRecord {
  id: number;
  username: string;
  full_name: string;
  role: string;
  login_time: string;
  login_count: number;
}

let inMemoryUserLogins: UserLoginRecord[] = [];

export const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3000;
const isDemoMode = process.env.DEMO_MODE === "true";

const configuredCorsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: configuredCorsOrigins.length > 0 ? configuredCorsOrigins : false
}));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(express.json({ limit: "50mb" }));


// Setup PostgreSQL connection with SSL support for Supabase/Neon/Cloud SQL
const isProductionDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes("supabase") ||
  process.env.DATABASE_URL.includes("neon") ||
  process.env.DATABASE_URL.includes("render") ||
  process.env.DATABASE_URL.includes("elephantsql") ||
  process.env.DATABASE_URL.includes("pooler") ||
  process.env.DATABASE_URL.includes("sslmode=") ||
  process.env.PGSSL === "true" ||
  process.env.NODE_ENV === "production"
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionDb
    ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== "false" }
    : undefined,
  // Keep serverless connection usage low. Supabase's pooler handles concurrency
  // across Vercel function instances.
  max: process.env.VERCEL ? 1 : 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true
});

pool.on("error", (err) => {
  console.error("⚠️ Unexpected error on idle PostgreSQL client:", err);
});

function sendInternalError(res: Response, context: string, error: unknown): Response {
  console.error(context, error);
  return res.status(500).json({ error: "Internal Server Error" });
}

// Check if string is a bcrypt hash
function isBcryptHash(str: string): boolean {
  return /^\$2[ayb]\$.{56}$/.test(str);
}

// Hash password helper
function hashPassword(pw: string): string {
  if (isBcryptHash(pw)) {
    return pw;
  }
  return bcrypt.hashSync(pw, 10);
}

// Helper to map DB row to user object
function mapRowToUser(row: any): any {
  if (!row) return null;
  return {
    username: row.username,
    fullName: row.full_name || "",
    role: row.role || "user",
    password: row.password || "",
    profilePic: row.profile_pic || ""
  };
}

function redactUserPassword(user: any): any {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

// Helper to map DB row to medical device object
function mapRowToDevice(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || "",
    deviceType: row.device_type || "",
    equipmentNo: row.equipment_no || "",
    department: row.department || "",
    location: row.location || "",
    manufacturer: row.manufacturer || "",
    model: row.model || "",
    serialNumber: row.serial_number || "",
    ipmRound: row.ipm_round || "",
    ipmDate: row.ipm_date || "",
    ipmDueDate: row.ipm_due_date || "",
    ipmReport: row.ipm_report || "",
    ipmTypes: Array.isArray(row.ipm_types) ? row.ipm_types : (typeof row.ipm_types === "string" ? JSON.parse(row.ipm_types) : (row.ipm_types || [])),
    temperature: row.temperature !== null ? parseFloat(row.temperature) : 0,
    humidity: row.humidity !== null ? parseFloat(row.humidity) : 0,
    status: row.status || "Registration",
    workflowStep: row.workflow_step !== null ? parseInt(row.workflow_step) : 1,
    registrationDate: row.registration_date || "",
    ipmCheckResult: row.ipm_check_result,
    ipmCheckDate: row.ipm_check_date,
    ipmTester: row.ipm_tester,
    ipmNotes: row.ipm_notes,
    repairDetails: row.repair_details,
    repairDate: row.repair_date,
    repairCost: row.repair_cost !== null ? parseFloat(row.repair_cost) : null,
    repairTechnician: row.repair_technician,
    certificateNo: row.certificate_no,
    certificateDate: row.certificate_date,
    approvedBy: row.approved_by,
    history: Array.isArray(row.history) ? row.history : (typeof row.history === "string" ? JSON.parse(row.history) : (row.history || [])),
    testApparatus: Array.isArray(row.test_apparatus) ? row.test_apparatus : (typeof row.test_apparatus === "string" ? JSON.parse(row.test_apparatus) : (row.test_apparatus || [])),
    qualitativeTasks: Array.isArray(row.qualitative_tasks) ? row.qualitative_tasks : (typeof row.qualitative_tasks === "string" ? JSON.parse(row.qualitative_tasks) : (row.qualitative_tasks || [])),
    quantitativeTasks: Array.isArray(row.quantitative_tasks) ? row.quantitative_tasks : (typeof row.quantitative_tasks === "string" ? JSON.parse(row.quantitative_tasks) : (row.quantitative_tasks || [])),
    pmTasks: Array.isArray(row.pm_tasks) ? row.pm_tasks : (typeof row.pm_tasks === "string" ? JSON.parse(row.pm_tasks) : (row.pm_tasks || [])),
    remarks: row.remarks || "",
    biomedSignatureName: row.biomed_signature_name || "",
    biomedSignatureDate: row.biomed_signature_date || "",
    headBiomedSignatureName: row.head_biomed_signature_name || "",
    headBiomedSignatureDate: row.head_biomed_signature_date || "",
    biomedSignatureImage: row.biomed_signature_path || "",
    headBiomedSignatureImage: row.head_biomed_signature_path || ""
  };
}

function toDatabaseDate(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).trim().split(/\s+/)[0];
  if (!cleaned) return null;

  let year: number;
  let month: number;
  let day: number;

  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const displayMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (displayMatch) {
    day = Number(displayMatch[1]);
    month = Number(displayMatch[2]);
    year = Number(displayMatch[3]);
  } else {
    return null;
  }

  if (year > 2400) year -= 543;

  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() !== month - 1
    || candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function deviceDbValues(device: any): any[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    String(device.id || "").trim(),
    device.name || "",
    device.deviceType || "",
    device.equipmentNo || "",
    device.department || "",
    device.location || "",
    device.manufacturer || "",
    device.model || "",
    device.serialNumber || "",
    device.ipmRound || "",
    toDatabaseDate(device.ipmDate),
    toDatabaseDate(device.ipmDueDate),
    device.ipmReport || "",
    JSON.stringify(device.ipmTypes || []),
    device.temperature ?? 0,
    device.humidity ?? 0,
    device.status || "Registration",
    device.workflowStep || 1,
    toDatabaseDate(device.registrationDate) || today,
    device.ipmCheckResult || null,
    toDatabaseDate(device.ipmCheckDate),
    device.ipmTester || null,
    device.ipmNotes || null,
    device.repairDetails || null,
    toDatabaseDate(device.repairDate),
    device.repairCost ?? null,
    device.repairTechnician || null,
    device.certificateNo || null,
    toDatabaseDate(device.certificateDate),
    device.approvedBy || null,
    device.remarks || "",
    device.biomedSignatureName || null,
    toDatabaseDate(device.biomedSignatureDate),
    device.headBiomedSignatureName || null,
    toDatabaseDate(device.headBiomedSignatureDate),
    device.biomedSignatureImage || null,
    device.headBiomedSignatureImage || null,
    JSON.stringify(device.testApparatus || []),
    JSON.stringify(device.qualitativeTasks || []),
    JSON.stringify(device.quantitativeTasks || []),
    JSON.stringify(device.pmTasks || [])
  ];
}

// Initialize database
async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL environment variable is not set. Database connection skipped.");
    return;
  }
  try {
    await pool.query("SELECT 1");
    const checkDevicesCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='devices' AND column_name='data'
    `);
    
    let oldDevices: any[] = [];
    let shouldMigrateDevices = checkDevicesCol.rows.length > 0;
    
    if (shouldMigrateDevices) {
      const oldRows = await pool.query("SELECT id, data FROM devices");
      oldDevices = oldRows.rows.map(r => JSON.parse(r.data));
      await pool.query("DROP TABLE IF EXISTS devices CASCADE");
    }

    const checkUsersCol = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='data'
    `);
    
    let oldUsers: any[] = [];
    let shouldMigrateUsers = checkUsersCol.rows.length > 0;
    
    if (shouldMigrateUsers) {
      const oldRows = await pool.query("SELECT username, data FROM users");
      oldUsers = oldRows.rows.map(r => JSON.parse(r.data));
      await pool.query("DROP TABLE IF EXISTS users CASCADE");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT,
        device_type TEXT,
        equipment_no TEXT,
        department TEXT,
        location TEXT,
        manufacturer TEXT,
        model TEXT,
        serial_number TEXT,
        ipm_round TEXT,
        ipm_date TEXT,
        ipm_due_date TEXT,
        ipm_report TEXT,
        ipm_types JSONB,
        temperature NUMERIC,
        humidity NUMERIC,
        status TEXT,
        workflow_step INTEGER,
        registration_date TEXT,
        ipm_check_result TEXT,
        ipm_check_date TEXT,
        ipm_tester TEXT,
        ipm_notes TEXT,
        repair_details TEXT,
        repair_date TEXT,
        repair_cost NUMERIC,
        repair_technician TEXT,
        certificate_no TEXT,
        certificate_date TEXT,
        approved_by TEXT,
        remarks TEXT,
        biomed_signature_name TEXT,
        biomed_signature_date TEXT,
        head_biomed_signature_name TEXT,
        head_biomed_signature_date TEXT,
        biomed_signature_path TEXT,
        head_biomed_signature_path TEXT,
        test_apparatus JSONB,
        qualitative_tasks JSONB,
        quantitative_tasks JSONB,
        pm_tasks JSONB
      );

      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        full_name TEXT,
        role TEXT,
        password TEXT,
        profile_pic TEXT
      );

      CREATE TABLE IF NOT EXISTS user_login_records (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        full_name TEXT,
        role TEXT,
        login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        login_count INTEGER DEFAULT 1
      );

      DROP TABLE IF EXISTS login_history;

      ALTER TABLE devices DROP COLUMN IF EXISTS device_class;
      ALTER TABLE devices DROP COLUMN IF EXISTS risk_level;

      ALTER TABLE devices ADD COLUMN IF NOT EXISTS test_apparatus JSONB;
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS qualitative_tasks JSONB;
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS quantitative_tasks JSONB;
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS pm_tasks JSONB;
    `);

    if (shouldMigrateDevices && oldDevices.length > 0) {
      const insertQuery = `
        INSERT INTO devices (
          id, name, device_type, equipment_no, department, location, manufacturer, model, serial_number,
          ipm_round, ipm_date, ipm_due_date, ipm_report, ipm_types, temperature, humidity, status, workflow_step,
          registration_date, ipm_check_result, ipm_check_date, ipm_tester, ipm_notes, repair_details, repair_date, repair_cost,
          repair_technician, certificate_no, certificate_date, approved_by, remarks, biomed_signature_name, biomed_signature_date, head_biomed_signature_name,
          head_biomed_signature_date, biomed_signature_path, head_biomed_signature_path,
          test_apparatus, qualitative_tasks, quantitative_tasks, pm_tasks
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37,
          $38, $39, $40, $41
        )
      `;
      for (const d of oldDevices) {
        await pool.query(insertQuery, deviceDbValues(d));
      }
    }

    if (shouldMigrateUsers && oldUsers.length > 0) {
      const insertQuery = `
        INSERT INTO users (username, full_name, role, password, profile_pic)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const u of oldUsers) {
        const pass = u.password ? hashPassword(u.password) : hashPassword(DEFAULT_USER_PASSWORD);
        await pool.query(insertQuery, [
          u.username, u.fullName, u.role, pass, u.profilePic
        ]);
      }
    }

    const countRes = await pool.query("SELECT count(*) as count FROM users");
    const count = parseInt(countRes.rows[0].count);
    if (count === 0) {
      assertBootstrapPasswords();
      const insertQuery = `
        INSERT INTO users (username, full_name, role, password, profile_pic)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const u of DEFAULT_USERS) {
        await pool.query(insertQuery, [
          u.username, u.fullName, u.role, hashPassword(u.password), u.profilePic || ""
        ]);
      }
    }

  } catch (e) {
    console.error("Database initialization failed:", e);
  }
}

// Schema initialization is a local/bootstrap concern. Running DDL on every
// Vercel cold start adds latency and can create lock contention.
if (!process.env.VERCEL) {
  void initDb();
}


let inMemoryUsers: any[] = [];
let inMemoryDevices: any[] = [];
let inMemoryInitialized = false;

function initInMemoryDb() {
  if (inMemoryInitialized) return;
  assertBootstrapPasswords();
  for (const u of DEFAULT_USERS) {
    inMemoryUsers.push({
      ...u,
      password: hashPassword(u.password)
    });
  }
  inMemoryInitialized = true;
}

// API Routes with Database connection check for diagnostics
app.get("/api/health", async (req, res) => {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production" && !isDemoMode) {
    return res.status(503).json({
      status: "degraded",
      database: "not_configured",
      missing: ["DATABASE_URL"]
    });
  }

  if (process.env.DATABASE_URL) {
    try {
      await pool.query("SELECT 1");
      return res.json({ status: "ok", database: "connected" });
    } catch (e) {
      return res.status(500).json({ 
        status: "degraded", 
        database: "disconnected", 
        error: "Failed to connect to database. Please check DATABASE_URL." 
      });
    }
  }
  res.json({ status: "ok", database: "in_memory" });
});

// Devices API
app.get("/api/devices", authenticateToken, async (req: any, res: any) => {
  try {
    if (process.env.DATABASE_URL) {
      const result = await pool.query("SELECT * FROM devices");
      const devices = result.rows.map((row) => {
        const dev = mapRowToDevice(row);
        dev.history = [];
        return dev;
      });
      return res.json(devices);
    }
    return res.json(inMemoryDevices);
  } catch (err) {
    sendInternalError(res, "Failed to load devices", err);
  }
});

app.post("/api/devices", authenticateToken, async (req: any, res: any) => {
  try {
    const devices = req.body;
    if (!Array.isArray(devices)) {
      return res.status(400).json({ error: "Expected an array of devices" });
    }
    
    const userRole = req.user.role;
    
    // Load all current devices from DB
    const existingMap = new Map<string, any>();
    if (process.env.DATABASE_URL) {
      const existingRows = await pool.query("SELECT * FROM devices");
      for (const r of existingRows.rows) {
        existingMap.set(r.id, mapRowToDevice(r));
      }
    } else {
      for (const d of inMemoryDevices) {
        existingMap.set(d.id, d);
      }
    }
    
    // Prevent deletion for non-admins
    if (userRole !== "admin") {
      const incomingIds = new Set(devices.map(d => d.id));
      for (const existingId of existingMap.keys()) {
        if (!incomingIds.has(existingId)) {
          return res.status(403).json({ error: "เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบอุปกรณ์ได้" });
        }
      }
    }
    
    // Check individual modifications & role-based transition safety
    for (const d of devices) {
      const existing = existingMap.get(d.id);
      
      // If absolutely no change to this device, skip transition verification
      if (existing && JSON.stringify(existing) === JSON.stringify(d)) {
        continue;
      }
      
      if (!canUserModifyDevice(userRole, existing, d)) {
        return res.status(403).json({ 
          error: `บัญชีของคุณ (${userRole}) ไม่มีสิทธิ์ในการแก้ไขหรือลงทะเบียนอุปกรณ์รหัส ${d.id}` 
        });
      }
    }
    
    if (process.env.DATABASE_URL) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // We no longer DELETE all devices on POST. POST /api/devices is used for bulk import (UPSERT).
        
        const insertQuery = `
          INSERT INTO devices (
            id, name, device_type, equipment_no, department, location, manufacturer, model, serial_number,
            ipm_round, ipm_date, ipm_due_date, ipm_report, ipm_types, temperature, humidity, status, workflow_step,
            registration_date, ipm_check_result, ipm_check_date, ipm_tester, ipm_notes, repair_details, repair_date, repair_cost,
            repair_technician, certificate_no, certificate_date, approved_by, remarks, biomed_signature_name, biomed_signature_date, head_biomed_signature_name,
            head_biomed_signature_date, biomed_signature_path, head_biomed_signature_path,
            test_apparatus, qualitative_tasks, quantitative_tasks, pm_tasks
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37,
            $38, $39, $40, $41
          ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            device_type = EXCLUDED.device_type,
            equipment_no = EXCLUDED.equipment_no,
            department = EXCLUDED.department,
            location = EXCLUDED.location,
            manufacturer = EXCLUDED.manufacturer,
            model = EXCLUDED.model,
            serial_number = EXCLUDED.serial_number,
            ipm_round = EXCLUDED.ipm_round,
            ipm_date = EXCLUDED.ipm_date,
            ipm_due_date = EXCLUDED.ipm_due_date,
            ipm_report = EXCLUDED.ipm_report,
            ipm_types = EXCLUDED.ipm_types,
            temperature = EXCLUDED.temperature,
            humidity = EXCLUDED.humidity,
            status = EXCLUDED.status,
            workflow_step = EXCLUDED.workflow_step,
            registration_date = EXCLUDED.registration_date,
            ipm_check_result = EXCLUDED.ipm_check_result,
            ipm_check_date = EXCLUDED.ipm_check_date,
            ipm_tester = EXCLUDED.ipm_tester,
            ipm_notes = EXCLUDED.ipm_notes,
            repair_details = EXCLUDED.repair_details,
            repair_date = EXCLUDED.repair_date,
            repair_cost = EXCLUDED.repair_cost,
            repair_technician = EXCLUDED.repair_technician,
            certificate_no = EXCLUDED.certificate_no,
            certificate_date = EXCLUDED.certificate_date,
            approved_by = EXCLUDED.approved_by,
            remarks = EXCLUDED.remarks,
            biomed_signature_name = EXCLUDED.biomed_signature_name,
            biomed_signature_date = EXCLUDED.biomed_signature_date,
            head_biomed_signature_name = EXCLUDED.head_biomed_signature_name,
            head_biomed_signature_date = EXCLUDED.head_biomed_signature_date,
            biomed_signature_path = EXCLUDED.biomed_signature_path,
            head_biomed_signature_path = EXCLUDED.head_biomed_signature_path,
            test_apparatus = EXCLUDED.test_apparatus,
            qualitative_tasks = EXCLUDED.qualitative_tasks,
            quantitative_tasks = EXCLUDED.quantitative_tasks,
            pm_tasks = EXCLUDED.pm_tasks
        `;
        
        for (const d of devices) {
          await client.query(insertQuery, deviceDbValues(d));
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    } else {
      inMemoryDevices = devices;
    }
    
    res.json({ success: true });
  } catch (err) {
    sendInternalError(res, "Failed to import devices", err);
  }
});

app.put("/api/devices/:id", authenticateToken, async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const device = req.body;
        const userRole = req.user.role;

        // Fetch existing from database to check transitions
        let existing = null;
        if (process.env.DATABASE_URL) {
            const result = await pool.query("SELECT * FROM devices WHERE id = $1", [id]);
            existing = result.rows.length > 0 ? mapRowToDevice(result.rows[0]) : null;
        } else {
            existing = inMemoryDevices.find(d => d.id === id) || null;
        }

        if (!canUserModifyDevice(userRole, existing, device)) {
            return res.status(403).json({ 
                error: `บัญชีของคุณ (${userRole}) ไม่มีสิทธิ์ในการแก้ไขหรือบันทึกข้อมูลอุปกรณ์ในขั้นตอนนี้` 
            });
        }

        if (process.env.DATABASE_URL) {
            const insertQuery = `
              INSERT INTO devices (
                id, name, device_type, equipment_no, department, location, manufacturer, model, serial_number,
                ipm_round, ipm_date, ipm_due_date, ipm_report, ipm_types, temperature, humidity, status, workflow_step,
                registration_date, ipm_check_result, ipm_check_date, ipm_tester, ipm_notes, repair_details, repair_date, repair_cost,
                repair_technician, certificate_no, certificate_date, approved_by, remarks, biomed_signature_name, biomed_signature_date, head_biomed_signature_name,
                head_biomed_signature_date, biomed_signature_path, head_biomed_signature_path,
                test_apparatus, qualitative_tasks, quantitative_tasks, pm_tasks
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
                $31, $32, $33, $34, $35, $36, $37,
                $38, $39, $40, $41
              )
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                device_type = EXCLUDED.device_type,
                equipment_no = EXCLUDED.equipment_no,
                department = EXCLUDED.department,
                location = EXCLUDED.location,
                manufacturer = EXCLUDED.manufacturer,
                model = EXCLUDED.model,
                serial_number = EXCLUDED.serial_number,
                ipm_round = EXCLUDED.ipm_round,
                ipm_date = EXCLUDED.ipm_date,
                ipm_due_date = EXCLUDED.ipm_due_date,
                ipm_report = EXCLUDED.ipm_report,
                ipm_types = EXCLUDED.ipm_types,
                temperature = EXCLUDED.temperature,
                humidity = EXCLUDED.humidity,
                status = EXCLUDED.status,
                workflow_step = EXCLUDED.workflow_step,
                registration_date = EXCLUDED.registration_date,
                ipm_check_result = EXCLUDED.ipm_check_result,
                ipm_check_date = EXCLUDED.ipm_check_date,
                ipm_tester = EXCLUDED.ipm_tester,
                ipm_notes = EXCLUDED.ipm_notes,
                repair_details = EXCLUDED.repair_details,
                repair_date = EXCLUDED.repair_date,
                repair_cost = EXCLUDED.repair_cost,
                repair_technician = EXCLUDED.repair_technician,
                certificate_no = EXCLUDED.certificate_no,
                certificate_date = EXCLUDED.certificate_date,
                approved_by = EXCLUDED.approved_by,
                remarks = EXCLUDED.remarks,
                biomed_signature_name = EXCLUDED.biomed_signature_name,
                biomed_signature_date = EXCLUDED.biomed_signature_date,
                head_biomed_signature_name = EXCLUDED.head_biomed_signature_name,
                head_biomed_signature_date = EXCLUDED.head_biomed_signature_date,
                biomed_signature_path = EXCLUDED.biomed_signature_path,
                head_biomed_signature_path = EXCLUDED.head_biomed_signature_path,
                test_apparatus = EXCLUDED.test_apparatus,
                qualitative_tasks = EXCLUDED.qualitative_tasks,
                quantitative_tasks = EXCLUDED.quantitative_tasks,
                pm_tasks = EXCLUDED.pm_tasks
            `;
            await pool.query(insertQuery, deviceDbValues(device));
        } else {
            const idx = inMemoryDevices.findIndex(d => d.id === id);
            if (idx >= 0) inMemoryDevices[idx] = device;
            else inMemoryDevices.push(device);
        }
        res.json({ success: true });
    } catch (err) {
        sendInternalError(res, "Failed to update device", err);
    }
});

app.delete("/api/devices/:id", authenticateToken, async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const userRole = req.user.role;
        if (userRole !== "admin" && userRole !== "registration") {
            return res.status(403).json({ error: "เฉพาะฝ่ายลงทะเบียนและผู้ดูแลระบบเท่านั้นที่สามารถลบอุปกรณ์ได้" });
        }
        
        if (process.env.DATABASE_URL) {
            await pool.query("DELETE FROM devices WHERE id = $1", [id]);
        } else {
            inMemoryDevices = inMemoryDevices.filter(d => d.id !== id);
        }
        res.json({ success: true });
    } catch (err) {
        sendInternalError(res, "Failed to delete device", err);
    }
});

// Users API
app.get("/api/users", authenticateToken, async (req: any, res: any) => {
  try {
    let users = [];
    if (process.env.DATABASE_URL) {
      const result = await pool.query("SELECT * FROM users");
      users = result.rows.map((r) => mapRowToUser(r));
    } else {
      initInMemoryDb();
      users = [...inMemoryUsers];
    }
    
    const visibleUsers = req.user.role === "admin"
      ? users
      : users.filter((user) => user.username === req.user.username);

    res.json(visibleUsers.map(redactUserPassword));
  } catch (err) {
    sendInternalError(res, "Failed to load users", err);
  }
});

app.post("/api/users", authenticateToken, async (req: any, res: any) => {
  try {
    const users = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Expected an array of users" });
    }
    
    const userRole = req.user.role;
    const username = req.user.username;
    
    // Load current database users
    let dbUsers = [];
    if (process.env.DATABASE_URL) {
      const result = await pool.query("SELECT * FROM users");
      dbUsers = result.rows.map((r) => mapRowToUser(r));
    } else {
      initInMemoryDb();
      dbUsers = [...inMemoryUsers];
    }
    const dbUsersMap = new Map<string, any>();
    for (const u of dbUsers) {
      dbUsersMap.set(u.username, u);
    }
    
    if (userRole !== "admin") {
      // Find logged in user in incoming list
      const incomingMe = users.find(u => u.username === username);
      if (!incomingMe) {
        return res.status(400).json({ error: "ไม่พบข้อมูลโปรไฟล์ของคุณในรายการที่ส่งมา" });
      }
      
      const dbMe = dbUsersMap.get(username);
      if (dbMe && incomingMe.role !== dbMe.role) {
        return res.status(403).json({ error: "คุณไม่มีสิทธิ์ในการเปลี่ยนสิทธิ์การใช้งาน (Role) ของตนเอง" });
      }
      
      // Check if they tried to change other users
      for (const u of users) {
        if (u.username !== username) {
          const dbU = dbUsersMap.get(u.username);
          if (!dbU || JSON.stringify(dbU) !== JSON.stringify(u)) {
            return res.status(403).json({ error: "คุณไม่มีสิทธิ์ในการแก้ไขบัญชีผู้ใช้อื่น" });
          }
        }
      }
      
      // Perform safe self-update merge
      const updatedUsers = dbUsers.map(u => {
        if (u.username === username) {
          let finalPw = dbMe ? dbMe.password : hashPassword(DEFAULT_USER_PASSWORD);
          if (incomingMe.password && incomingMe.password.trim() !== "") {
            const trimmedPw = incomingMe.password.trim();
            const isHashed = trimmedPw.startsWith("$2a$") || trimmedPw.startsWith("$2b$") || trimmedPw.startsWith("$2y$");
            if (!isHashed) {
              finalPw = hashPassword(trimmedPw);
            }
          }
          return {
            ...u,
            fullName: incomingMe.fullName || u.fullName,
            profilePic: incomingMe.profilePic,
            password: finalPw
          };
        }
        return u;
      });
      
      if (process.env.DATABASE_URL) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query("DELETE FROM users");
          
          const insertQuery = `
            INSERT INTO users (username, full_name, role, password, profile_pic)
            VALUES ($1, $2, $3, $4, $5)
          `;
          for (const u of updatedUsers) {
            await client.query(insertQuery, [
              u.username, u.fullName, u.role, u.password, u.profilePic
            ]);
          }
          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      } else {
        inMemoryUsers = updatedUsers;
      }
      
      return res.json({ success: true });
    }
    
    // Admin path: can overwrite user metadata while preserving existing
    // password hashes whenever the password field is left blank.
    const normalizedUsers = [];
    for (const incomingUser of users) {
      const existingUser = dbUsersMap.get(incomingUser.username);
      const suppliedPassword = String(incomingUser.password || "").trim();

      if (!existingUser && !suppliedPassword) {
        return res.status(400).json({
          error: `กรุณาตั้งรหัสผ่านเริ่มต้นสำหรับผู้ใช้ ${incomingUser.username}`
        });
      }

      normalizedUsers.push({
        ...incomingUser,
        password: suppliedPassword
          ? hashPassword(suppliedPassword)
          : existingUser.password
      });
    }

    if (process.env.DATABASE_URL) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("DELETE FROM users"); // replace all
        
        const insertQuery = `
          INSERT INTO users (username, full_name, role, password, profile_pic)
          VALUES ($1, $2, $3, $4, $5)
        `;
        for (const u of normalizedUsers) {
          await client.query(insertQuery, [
            u.username, u.fullName, u.role, u.password, u.profilePic
          ]);
        }
        await client.query("COMMIT");
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    } else {
      inMemoryUsers = normalizedUsers;
    }
    
    res.json({ success: true });
  } catch (err) {
    sendInternalError(res, "Failed to save users", err);
  }
});

// Rate limiting specifically for the login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per 15 minutes
  handler: (req, res) => {
    res.status(429).json({ error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง" });
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน" });
    }

    if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production" && !isDemoMode) {
      return res.status(503).json({
        error: "ระบบฐานข้อมูลยังไม่ได้ตั้งค่า DATABASE_URL บนเซิร์ฟเวอร์"
      });
    }

    let user = null;
    if (process.env.DATABASE_URL) {
      try {
        const result = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username.trim()]);
        if (result.rows.length > 0) {
          user = mapRowToUser(result.rows[0]);
        }
      } catch (e) {
        console.error("DB Login error", e);
        return res.status(503).json({
          error: "ไม่สามารถเชื่อมต่อระบบยืนยันตัวตนได้ กรุณาลองใหม่ภายหลัง"
        });
      }
    } else {
      initInMemoryDb();
      user = inMemoryUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    }
    if (!user) {
      return res.status(401).json({ error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" });
    }
    const dbPassword = user.password;

    // Use safe compare
    let isMatch = false;
    if (dbPassword) {
      isMatch = bcrypt.compareSync(password, dbPassword);
    }

    if (!isMatch) {
      return res.status(401).json({ error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" });
    }

    // Strip password before returning and generate secure session token
    const { password: _, ...userInfo } = user;
    const token = generateToken({ username: user.username, role: user.role });

    // Record login event in DB (Supabase/PostgreSQL) and in-memory
    let userLoginCount = 1;
    const nowIso = new Date().toISOString();

    if (process.env.DATABASE_URL) {
      try {
        const countRes = await pool.query(
          "SELECT COUNT(*) as cnt FROM user_login_records WHERE LOWER(username) = LOWER($1)",
          [user.username]
        );
        userLoginCount = (parseInt(countRes.rows[0]?.cnt || "0", 10)) + 1;

        await pool.query(
          "INSERT INTO user_login_records (username, full_name, role, login_time, login_count) VALUES ($1, $2, $3, NOW(), $4)",
          [user.username, user.fullName || user.username, user.role || "", userLoginCount]
        );
      } catch (logErr) {
        console.error("Failed to record login in DB:", logErr);
      }
    } else {
      const prevLogins = inMemoryUserLogins.filter(
        l => l.username.toLowerCase() === user.username.toLowerCase()
      );
      userLoginCount = prevLogins.length + 1;
      inMemoryUserLogins.unshift({
        id: Date.now(),
        username: user.username,
        full_name: user.fullName || user.username,
        role: user.role || "",
        login_time: nowIso,
        login_count: userLoginCount
      });
    }

    res.json({ ...userInfo, loginCount: userLoginCount, token });
  } catch (err) {
    sendInternalError(res, "Login failed", err);
  }
});

// Endpoint to fetch user login history
app.get(
  "/api/user-logins",
  authenticateToken,
  requireRole(["admin"]),
  async (req: any, res: any) => {
  try {
    if (process.env.DATABASE_URL) {
      const result = await pool.query(
        "SELECT id, username, full_name, role, login_time, COALESCE(login_count, 1) as login_count FROM user_login_records ORDER BY login_time DESC LIMIT 500"
      );
      return res.json(result.rows);
    } else {
      return res.json(inMemoryUserLogins);
    }
  } catch (err) {
    sendInternalError(res, "Failed to fetch user logins", err);
  }
  }
);


// Centralized Error Handling Middleware (Prevents leakage of stack trace in Production)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: {
      message: isProduction ? 'Internal Server Error' : err.message,
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Vercel invokes the Express app through api/index.ts. A long-lived listener is
// only needed for local development or traditional Node hosting.
if (!process.env.VERCEL) {
  void startServer();
}
