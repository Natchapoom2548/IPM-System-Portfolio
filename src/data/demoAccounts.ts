export type DemoRole = "admin" | "registration" | "reporting" | "ipm" | "repair";

export interface DemoAccount {
  username: string;
  fullName: string;
  role: DemoRole;
  profilePic: string;
}

// These credentials are intentionally public and work only inside this
// fictional portfolio demo. They are not used by any external service.
export const DEMO_PASSWORD = "Demo123!";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "demo_admin",
    fullName: "ผู้ดูแลระบบสาธิต",
    role: "admin",
    profilePic: "",
  },
  {
    username: "demo_registration",
    fullName: "เจ้าหน้าที่ลงทะเบียนสาธิต",
    role: "registration",
    profilePic: "",
  },
  {
    username: "demo_ipm",
    fullName: "เจ้าหน้าที่ IPM สาธิต",
    role: "ipm",
    profilePic: "",
  },
  {
    username: "demo_repair",
    fullName: "ช่างซ่อมบำรุงสาธิต",
    role: "repair",
    profilePic: "",
  },
  {
    username: "demo_reporting",
    fullName: "เจ้าหน้าที่รายงานผลสาธิต",
    role: "reporting",
    profilePic: "",
  },
];

export function createDemoToken(account: DemoAccount): string {
  return `portfolio-demo:${account.username}:${account.role}`;
}

export function accountFromDemoToken(token: string | undefined): DemoAccount | null {
  if (!token?.startsWith("portfolio-demo:")) return null;
  const [, username, role] = token.split(":");
  return DEMO_ACCOUNTS.find(
    (account) => account.username === username && account.role === role,
  ) ?? null;
}
