import { MedicalDevice } from "../types";

/**
 * Date utility helpers to format dates into Buddhist Era (พ.ศ. / B.E.)
 */

/**
 * Converts any Christian year (1900-2100) inside a string to a Buddhist year (พ.ศ. = year + 543).
 * It preserves the rest of the string layout.
 */
export function convertToBE(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  
  // Try to find any 4-digit numbers in the string that represent Christian years (1900-2100)
  // and convert them to B.E. (year + 543)
  return dateStr.replace(/\b(19|20|21)\d{2}\b/g, (match) => {
    const year = parseInt(match, 10);
    if (year >= 1900 && year <= 2100) {
      return (year + 543).toString();
    }
    return match;
  });
}

/**
 * Formats a Date object or ISO date string directly into a DD/MM/YYYY B.E. format.
 */
export function formatDateBE(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    // If invalid date, try to run general conversion
    return convertToBE(String(date));
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const yearBE = d.getFullYear() + 543;
  return `${day}/${month}/${yearBE}`;
}

/**
 * Gets today's date string in B.E. format (DD/MM/YYYY)
 */
export function getTodayStrBE(): string {
  return formatDateBE(new Date());
}

/**
 * Gets today's date and time string in B.E. format (DD/MM/YYYY HH:MM)
 */
export function getTodayDateTimeStrBE(): string {
  const d = new Date();
  const datePart = formatDateBE(d);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${datePart} ${hours}:${minutes}`;
}

/**
 * Converts all date properties of a MedicalDevice to B.E. (พ.ศ.) format.
 */
export function convertDeviceToBE(device: MedicalDevice): MedicalDevice {
  return {
    ...device,
    ipmRound: convertToBE(device.ipmRound),
    ipmDate: convertToBE(device.ipmDate),
    ipmDueDate: convertToBE(device.ipmDueDate),
    registrationDate: convertToBE(device.registrationDate),
    ipmCheckDate: device.ipmCheckDate ? convertToBE(device.ipmCheckDate) : null,
    repairDate: device.repairDate ? convertToBE(device.repairDate) : null,
    certificateDate: device.certificateDate ? convertToBE(device.certificateDate) : null,
    certificateNo: device.certificateNo ? convertToBE(device.certificateNo) : null,
    biomedSignatureDate: device.biomedSignatureDate ? convertToBE(device.biomedSignatureDate) : undefined,
    headBiomedSignatureDate: device.headBiomedSignatureDate ? convertToBE(device.headBiomedSignatureDate) : undefined,
    history: (device.history || []).map((h) => ({
      ...h,
      date: convertToBE(h.date)
    })),
    testApparatus: device.testApparatus?.map((ta) => ({
      ...ta,
      calDueDate: convertToBE(ta.calDueDate)
    }))
  };
}

/**
 * Gets the standard IPM Report prefix for a given device template name or type.
 */
export function getPrefixForDevice(name: string): string {
  if (!name) return "OT";
  const n = name.toLowerCase();
  
  if (n === "nibp") {
    return "NIBP";
  }
  if (n.includes("pulse oximeter") || n.includes("spo2") || n.includes("oximeter")) {
    return "SPO2";
  }
  if (n.includes("patient monitor") || n.includes("monitor")) {
    return "PM";
  }
  if (n.includes("o2 concentrator") || n.includes("oxygen") || n.includes("concentrator")) {
    return "OX";
  }
  if (n === "aed") {
    return "AED";
  }
  if (n.includes("defibrillator")) {
    return "DEF";
  }
  if (n.includes("doptone") || n.includes("doppler")) {
    return "DOP";
  }
  if (n.includes("ecg") || n.includes("electrocardiograph")) {
    return "ECG";
  }
  if (n.includes("centrifuge")) {
    return "CF";
  }
  if (n.includes("weighing") || n.includes("scale") || n.includes("weight")) {
    return "WS";
  }
  if (n.includes("syringe pump")) {
    return "SP";
  }
  if (n.includes("infusion pump")) {
    return "IP";
  }
  if (n.includes("ventilator")) {
    return "VENT";
  }
  if (n.includes("refrigerator thermometer")) {
    return "RT";
  }
  if (n.includes("infrared")) {
    return "IRT";
  }
  if (n.includes("thermometer")) {
    return "TH";
  }
  if (n === "esa") {
    return "ESA";
  }
  return "OT";
}

/**
 * Automatically generates the next sequence number for a given prefix.
 */
export function generateNextReportCodeForPrefix(prefix: string, devices: MedicalDevice[]): string {
  const regex = new RegExp(`^${prefix}-(\\d+)`, 'i');
  const numbers = devices.map((d) => {
    const match = d.ipmReport ? d.ipmReport.match(regex) : null;
    return match ? parseInt(match[1], 10) : 0;
  });
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum.toString().padStart(3, "0")}`;
}

