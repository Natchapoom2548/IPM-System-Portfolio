/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DeviceStatus = "Registration" | "IPM" | "Repair" | "Reporting" | "Completed";

export interface WorkflowHistory {
  date: string;
  action: string;
  note: string;
  user: string;
}

export interface MedicalDevice {
  id: string; // e.g. "S03-PM-001"
  name: string; // e.g. "NIBP Monitor"
  deviceType: string;
  equipmentNo: string; // e.g. "DEF-2041-A2"
  department: string; // e.g. "Cardiology"
  location: string; // e.g. "รพ.สต. ดอนสัก"
  manufacturer: string; // e.g. "Physio-Control"
  model: string; // e.g. "Lifepak 15"
  serialNumber: string; // e.g. "SN-7721-DF"
  ipmRound: string; // e.g. "R3-2026"
  ipmDate: string; // e.g. "04/07/2026"
  ipmDueDate: string; // e.g. "01 / 2027"
  ipmReport: string; // e.g. "BP-001"
  ipmTypes: string[]; // e.g. ["New Equipment"]
  temperature: number; // e.g. 24.2
  humidity: number; // e.g. 52.5
  status: DeviceStatus;
  workflowStep: number; // 1, 2, 3, 4
  registrationDate: string;
  
  // IPM Phase details
  ipmCheckResult: "Passed" | "Failed" | null;
  ipmCheckDate: string | null;
  ipmTester: string | null;
  ipmNotes: string | null;

  // Repair Phase details
  repairDetails: string | null;
  repairDate: string | null;
  repairCost: number | null;
  repairTechnician: string | null;

  // Reporting Phase details
  certificateNo: string | null;
  certificateDate: string | null;
  approvedBy: string | null;

  history: WorkflowHistory[];

  // Detailed IPM form fields
  testApparatus?: {
    equipment: string;
    manufacturer: string;
    brandModel: string;
    serialNo: string;
    certificateNo: string;
    calDueDate: string;
  }[];
  qualitativeTasks?: {
    taskName: string;
    result: "PASS" | "FAIL" | "N/A" | "";
    comment: string;
  }[];
  quantitativeTasks?: {
    groupLabel: string;
    controlSetting: string;
    criteria: string;
    setting: string;
    display: string;
    measured: string;
    result: "PASS" | "FAIL" | "N/A" | "";
    m1?: string;
    m2?: string;
    m3?: string;
    avg?: string;
  }[];
  pmTasks?: {
    taskName: string;
    done: boolean;
    comment: string;
  }[];
  remarks?: string;
  biomedSignatureName?: string;
  biomedSignatureDate?: string;
  headBiomedSignatureName?: string;
  headBiomedSignatureDate?: string;
  biomedSignatureImage?: string;
  headBiomedSignatureImage?: string;
}

export interface DeviceTemplate {
  name: string;
  deviceType: string;
  manufacturer: string;
  model: string;
}
