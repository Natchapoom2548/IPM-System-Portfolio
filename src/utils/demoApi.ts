import {
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
  accountFromDemoToken,
  createDemoToken,
} from "../data/demoAccounts";
import { INITIAL_DEVICES } from "../data/mockData";
import type { MedicalDevice } from "../types";

interface DemoLoginRecord {
  id: number;
  username: string;
  full_name: string;
  role: string;
  login_time: string;
  login_count: number;
}

const STORAGE_KEYS = {
  devices: "portfolio_demo_devices_v2",
  users: "portfolio_demo_users_v2",
  logins: "portfolio_demo_logins_v2",
} as const;

let memoryDevices = clone(INITIAL_DEVICES);
let memoryUsers = clone(DEMO_ACCOUNTS);
let memoryLogins: DemoLoginRecord[] = [];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory fallback keeps the demo usable when storage is blocked.
  }
}

function getDevices(): MedicalDevice[] {
  memoryDevices = readStorage(STORAGE_KEYS.devices, memoryDevices);
  return clone(memoryDevices);
}

function setDevices(devices: MedicalDevice[]): void {
  memoryDevices = clone(devices);
  writeStorage(STORAGE_KEYS.devices, memoryDevices);
}

function getUsers() {
  memoryUsers = readStorage(STORAGE_KEYS.users, memoryUsers);
  return clone(memoryUsers);
}

function setUsers(users: typeof DEMO_ACCOUNTS): void {
  memoryUsers = clone(users);
  writeStorage(STORAGE_KEYS.users, memoryUsers);
}

function getLogins(): DemoLoginRecord[] {
  memoryLogins = readStorage(STORAGE_KEYS.logins, memoryLogins);
  return clone(memoryLogins);
}

function setLogins(records: DemoLoginRecord[]): void {
  memoryLogins = clone(records.slice(0, 100));
  writeStorage(STORAGE_KEYS.logins, memoryLogins);
}

function currentSession(): { username: string; role: string } | null {
  try {
    const stored = localStorage.getItem("current_user_v1");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const account = accountFromDemoToken(parsed?.token);
    return account && account.username === parsed?.username && account.role === parsed?.role
      ? { username: account.username, role: account.role }
      : null;
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function requestBody(input: string | Request, init?: RequestInit): Promise<any> {
  if (typeof init?.body === "string") {
    return JSON.parse(init.body);
  }
  if (input instanceof Request) {
    return input.clone().json();
  }
  return undefined;
}

function routeDetails(input: string | Request): { pathname: string; methodFromRequest?: string } {
  const rawUrl = typeof input === "string" ? input : input.url;
  const url = new URL(rawUrl, window.location.origin);
  return {
    pathname: url.pathname.replace(/\/+$/, "") || "/",
    methodFromRequest: input instanceof Request ? input.method : undefined,
  };
}

function sanitizedUsers(users: any[]) {
  return users.map(({ password: _password, ...user }) => user);
}

export function resetDemoStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("current_user_v1");
  } catch {
    // Reset the memory fallback even when browser storage is unavailable.
  }
  memoryDevices = clone(INITIAL_DEVICES);
  memoryUsers = clone(DEMO_ACCOUNTS);
  memoryLogins = [];
}

export async function handleDemoApiRequest(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  const { pathname, methodFromRequest } = routeDetails(input);
  const method = (init?.method || methodFromRequest || "GET").toUpperCase();

  if (pathname === "/api/health" && method === "GET") {
    return jsonResponse({
      status: "ok",
      mode: "portfolio_demo",
      persistence: "browser_local_storage",
      database: "disabled",
    });
  }

  if (pathname === "/api/login" && method === "POST") {
    const body = await requestBody(input, init);
    const username = String(body?.username || "").trim().toLowerCase();
    const account = DEMO_ACCOUNTS.find(
      (candidate) => candidate.username.toLowerCase() === username,
    );

    if (!account || body?.password !== DEMO_PASSWORD) {
      return jsonResponse({ error: "บัญชีหรือรหัสผ่านสาธิตไม่ถูกต้อง" }, 401);
    }

    const records = getLogins();
    const previous = records.find((record) => record.username === account.username);
    setLogins([
      {
        id: Date.now(),
        username: account.username,
        full_name: account.fullName,
        role: account.role,
        login_time: new Date().toISOString(),
        login_count: (previous?.login_count || 0) + 1,
      },
      ...records,
    ]);

    return jsonResponse({
      ...account,
      token: createDemoToken(account),
      demo: true,
    });
  }

  const session = currentSession();
  if (!session) {
    return jsonResponse({ error: "กรุณาเข้าสู่ระบบด้วยบัญชีสาธิต" }, 401);
  }

  if (pathname === "/api/devices" && method === "GET") {
    return jsonResponse(getDevices());
  }

  if (pathname === "/api/devices" && method === "POST") {
    const devices = await requestBody(input, init);
    if (!Array.isArray(devices)) {
      return jsonResponse({ error: "Expected an array of demo devices" }, 400);
    }
    setDevices(devices);
    return jsonResponse({ success: true, persistence: "localStorage" });
  }

  const deviceMatch = pathname.match(/^\/api\/devices\/([^/]+)$/);
  if (deviceMatch && method === "PUT") {
    const device = await requestBody(input, init) as MedicalDevice;
    const devices = getDevices();
    const index = devices.findIndex((candidate) => candidate.id === deviceMatch[1]);
    if (index >= 0) devices[index] = device;
    else devices.push(device);
    setDevices(devices);
    return jsonResponse({ success: true, persistence: "localStorage" });
  }

  if (deviceMatch && method === "DELETE") {
    setDevices(getDevices().filter((device) => device.id !== deviceMatch[1]));
    return jsonResponse({ success: true, persistence: "localStorage" });
  }

  if (pathname === "/api/users" && method === "GET") {
    const users = sanitizedUsers(getUsers());
    return jsonResponse(
      session.role === "admin"
        ? users
        : users.filter((user) => user.username === session.username),
    );
  }

  if (pathname === "/api/users" && method === "POST") {
    const incomingUsers = await requestBody(input, init);
    if (!Array.isArray(incomingUsers)) {
      return jsonResponse({ error: "Expected an array of demo users" }, 400);
    }

    const cleanIncoming = sanitizedUsers(incomingUsers);
    if (session.role === "admin") {
      setUsers(cleanIncoming);
    } else {
      const currentUsers = getUsers();
      const ownUpdate = cleanIncoming.find((user) => user.username === session.username);
      if (ownUpdate) {
        setUsers(currentUsers.map((user) => (
          user.username === session.username ? { ...user, ...ownUpdate } : user
        )));
      }
    }
    return jsonResponse({ success: true, persistence: "localStorage", simulated: true });
  }

  if (pathname === "/api/user-logins" && method === "GET") {
    if (session.role !== "admin") {
      return jsonResponse({ error: "สิทธิ์นี้ใช้ได้เฉพาะบัญชี demo_admin" }, 403);
    }
    return jsonResponse(getLogins());
  }

  return jsonResponse({ error: "Demo route not found" }, 404);
}
