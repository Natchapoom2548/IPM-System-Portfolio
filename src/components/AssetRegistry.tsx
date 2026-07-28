/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle, 
  ShieldAlert, 
  Flame, 
  ChevronRight,
  Edit2,
  Lock,
  Info,
  MapPin,
  Filter,
  Upload,
  X,
  AlertCircle,
  Check,
  FileText,
  RefreshCw,
  Table
} from "lucide-react";
import { MedicalDevice } from "../types";
import { getTodayStrBE, getPrefixForDevice } from "../utils/dateUtils";
import { HOSPITALS } from "../data/mockData";
import sarabunRegularUrl from "../assets/fonts/Sarabun-Regular.ttf?url";
import sarabunBoldUrl from "../assets/fonts/Sarabun-Bold.ttf?url";
import {
  createDefaultChecklistsForDevice,
  getChecklistCategory,
  type DeviceChecklistCategory
} from "./IPMWorkflow";

const HOSPITAL_ABBREVIATIONS: Record<string, string> = {
  "รพ.สต. ตัวอย่าง 01": "S01",
  "รพ.สต. ตัวอย่าง 02": "S02",
  "รพ.สต. ตัวอย่าง 03": "S03",
  "รพ.สต. ตัวอย่าง 04": "S04",
  "รพ.สต. ตัวอย่าง 05": "S05",
  "รพ.สต. ตัวอย่าง 06": "S06",
  "รพ.สต. ตัวอย่าง 07": "S07",
  "รพ.สต. ตัวอย่าง 08": "S08",
  "รพ.สต. ตัวอย่าง 09": "S09",
  "รพ.สต. ตัวอย่าง 10": "S10",
  "รพ.สต. ตัวอย่าง 11": "S11",
  "รพ.สต. ตัวอย่าง 12": "S12",
  "รพ.สต. ตัวอย่าง 13": "S13",
  "รพ.สต. ตัวอย่าง 14": "S14",
  "รพ.สต. ตัวอย่าง 15": "S15",
  "รพ.สต. ตัวอย่าง 16": "S16",
};

const CANONICAL_DEVICE_NAMES: Record<DeviceChecklistCategory, string> = {
  AED: "AED",
  Defibrillator: "Defibrillator",
  ECG: "ECG Machine",
  Weight: "Weight Machine",
  Centrifuge: "Centrifuge",
  "Syringe Pump": "Syringe Pump",
  "Infusion Pump": "Infusion Pump",
  Ventilator: "Ventilator",
  "Patient Monitor": "Patient Monitor",
  SpO2: "Pulse Oximeter",
  Doptone: "Doptone",
  NIBP: "Blood Pressure Monitor",
  "Oxygen Concentrator": "Oxygen Concentrator",
  Thermometer: "Refrigerator Thermometer",
  Sphygmomanometer: "Sphygmomanometer",
  "Fetal Monitor": "Fetal Monitor",
  "General Medical Device": "Others"
};

interface AssetRegistryProps {
  devices: MedicalDevice[];
  onOpenRegisterForm: () => void;
  onImportDevices?: (newDevices: MedicalDevice[]) => void;
  onSendToIPM: (id: string) => void;
  onDeleteDevice: (id: string) => void;
  onOpenDeviceDetail: (id: string) => void;
  onEditDevice: (id: string) => void;
  userRole?: string;
}

const mapThaiDeviceToEnglish = (thaiName: string): string => {
  const t = thaiName.trim().toLowerCase();
  if (!t) return "Others";

  if (t.includes("ความดัน") || t.includes("nibp") || t.includes("blood pressure") || t.includes("pressure")) {
    return "Blood Pressure Monitor";
  }
  if (t.includes("ผลิตออกซิเจน") || t.includes("concentrator") || t.includes("oxygen")) {
    return "Oxygen Concentrator";
  }
  if (t.includes("เฝ้าติดตาม") || t.includes("patient monitor") || t.includes("spo2") || t.includes("สปอยูทู")) {
    return "Patient Monitor";
  }
  if (t.includes("กระตุก") || t.includes("aed") || t.includes("defibrillator")) {
    return "Defibrillator";
  }
  if (t.includes("คลื่นไฟฟ้า") || t.includes("ecg") || t.includes("electrocardiograph")) {
    return "ECG Machine";
  }
  if (t.includes("ปั่นฮีมาโตคริต") || t.includes("ปั่น") || t.includes("เหวี่ยง") || t.includes("centrifuge")) {
    return "Centrifuge";
  }
  if (t.includes("ชั่ง") || t.includes("weight") || t.includes("นํ้าหนัก")) {
    return "Weight Machine";
  }
  if (t.includes("เทอร์โม") || t.includes("ปรอท") || t.includes("วัดอุณหภูมิ") || t.includes("ความชื้น") || t.includes("temperature") || t.includes("thermometer") || t.includes("refrigerator")) {
    return "Refrigerator Thermometer";
  }
  
  if (t.includes("blood pressure")) return "Blood Pressure Monitor";
  if (t.includes("oxygen")) return "Oxygen Concentrator";
  if (t.includes("patient monitor") || t.includes("monitor")) return "Patient Monitor";
  if (t.includes("defibrillator") || t.includes("aed")) return "Defibrillator";
  if (t.includes("ecg") || t.includes("electrocardiogram")) return "ECG Machine";
  if (t.includes("centrifuge")) return "Centrifuge";
  if (t.includes("weighing") || t.includes("scale") || t.includes("weight")) return "Weight Machine";
  if (t.includes("thermometer")) return "Refrigerator Thermometer";

  return "Others";
};

const splitCombinedColumn = (text: string): { brand: string; model: string; equipNo: string } => {
  const parts = text.trim().split(/\s+/);
  if (parts.length === 0) {
    return { brand: "-", model: "-", equipNo: "-" };
  }
  if (parts.length === 1) {
    return { brand: parts[0], model: "-", equipNo: "-" };
  }
  
  const lastPart = parts[parts.length - 1];
  
  // If there are 3 or more parts, we assume the last part is the Equipment Number 
  // (especially if it has hyphens, slashes, or digits)
  if (parts.length >= 3) {
    const hasHyphenOrSlashOrManyDigits = lastPart.includes("-") || lastPart.includes("/") || (lastPart.match(/\d/g) || []).length > 4;
    if (hasHyphenOrSlashOrManyDigits || /\d/.test(lastPart)) {
      const equipNo = lastPart;
      const brand = parts[0];
      const model = parts.slice(1, parts.length - 1).join(" ");
      return { brand, model: model || "-", equipNo };
    }
  }
  
  // If only 2 parts, e.g., "COVIDIEN MBP2106664"
  if (parts.length === 2) {
    // If the second part has hyphens or slashes, it's probably an Equipment Number
    if (lastPart.includes("-") || lastPart.includes("/")) {
      return { brand: parts[0], model: "-", equipNo: lastPart };
    } else {
      // Otherwise, it's probably the Model
      return { brand: parts[0], model: lastPart, equipNo: "-" };
    }
  }
  
  return { brand: parts[0], model: parts.slice(1).join(" "), equipNo: "-" };
};

const detectHospital = (fileName: string, fullPdfText: string): string => {
  const combined = (fileName + " " + fullPdfText).toLowerCase();
  for (const hospital of HOSPITALS) {
    const hName = hospital.name.replace("รพ.สต. ", "").trim().toLowerCase();
    if (combined.includes(hospital.name.toLowerCase()) || combined.includes(hName)) {
      return hospital.name;
    }
  }
  return HOSPITALS[0].name;
};

const processAndSplitRow = (row: string[]): string[] => {
  if (row.length === 0) return [];
  
  const isHeader = row.some(cell => 
    ["ที่", "ชื่อเครื่อง", "ยี่ห้อ", "รุ่น", "เลขครุภัณฑ์", "รหัสครุภัณฑ์"].some(kw => cell.toLowerCase().includes(kw))
  );
  if (isHeader) {
    return ["ที่", "ชื่อเครื่องมือแพทย์", "ยี่ห้อ (Manufacturer)", "รุ่น (Model)", "เลขครุภัณฑ์ (Equipment No)"];
  }

  // Join all row elements to form a complete string of the row, to avoid any column-separation bugs!
  const fullRowText = row.map(c => c.trim()).filter(Boolean).join(" ");

  // Let's parse the fullRowText!
  // Standard row format: <index> <Thai Name> <Brand> <Model> <Equip No>
  // Let's extract the index first
  let index = "";
  let remainingText = fullRowText;

  // Match leading number (index) e.g. "1", "12"
  const indexMatch = remainingText.match(/^(\d+)\s+(.*)$/);
  if (indexMatch) {
    index = indexMatch[1];
    remainingText = indexMatch[2].trim();
  }

  // Now we have remainingText, which contains: <Thai Name> <Brand> <Model> <Equip No>
  // Let's use a regex to separate the Thai part from the English/Alphanumeric part.
  let thaiPart = "";
  let englishPart = "";

  const thaiEnglishMatch = remainingText.match(/^([ก-๙\s/()+-]+?)\s+([A-Za-z0-9].*)$/);
  if (thaiEnglishMatch) {
    thaiPart = thaiEnglishMatch[1].trim();
    englishPart = thaiEnglishMatch[2].trim();
  } else {
    // Fallback: if no clear English part, or all Thai, or all English
    const firstEngIndex = remainingText.search(/[A-Za-z0-9]/);
    if (firstEngIndex !== -1) {
      thaiPart = remainingText.substring(0, firstEngIndex).trim();
      englishPart = remainingText.substring(firstEngIndex).trim();
    } else {
      thaiPart = remainingText;
      englishPart = "";
    }
  }

  // Let's clean the Thai name from some OCR errors
  const cleanName = thaiPart
    .replace(/รื่รื่/g, "รื่อ")
    .replace(/้ร้/g, "ร้อ")
    .replace(/ิริ/g, "ิต")
    .replace(/รื่/g, "รื่อ")
    .trim();

  // Now split the englishPart (which contains Brand, Model, Equip No)
  let brand = "-";
  let model = "-";
  let equipNo = "-";

  if (englishPart) {
    const splitResult = splitCombinedColumn(englishPart);
    brand = splitResult.brand;
    model = splitResult.model;
    equipNo = splitResult.equipNo;
  }

  return [index, cleanName, brand, model, equipNo];
};

export default function AssetRegistry({
  devices,
  onOpenRegisterForm,
  onImportDevices,
  onSendToIPM,
  onDeleteDevice,
  onOpenDeviceDetail,
  onEditDevice,
  userRole = "admin"
}: AssetRegistryProps) {

  const canEdit = userRole === "admin" || userRole === "registration";

  const [selectedProvince, setSelectedProvince] = useState<"ทั้งหมด" | "ตัวอย่างเหนือ" | "ตัวอย่างกลาง">("ทั้งหมด");
  const [selectedHospital, setSelectedHospital] = useState<string>("ทั้งหมด");
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [detectedHospitalName, setDetectedHospitalName] = useState<string | null>(null);
  const [selectedImportHospital, setSelectedImportHospital] = useState<string>("");

  useEffect(() => {
    if (detectedHospitalName) {
      setSelectedImportHospital(detectedHospitalName);
    } else if (HOSPITALS && HOSPITALS.length > 0) {
      setSelectedImportHospital(HOSPITALS[0].name);
    }
  }, [detectedHospitalName]);
  
  // Column Mappings (indexes in CSV row)
  const [fieldMappings, setFieldMappings] = useState<{
    name: number;
    serialNumber: number;
    manufacturer: number;
    model: number;
    equipmentNo: number;
    department: number;
  }>({
    name: -1,
    serialNumber: -1,
    manufacturer: -1,
    model: -1,
    equipmentNo: -1,
    department: -1,
  });

  const getExcelColLetter = (index: number): string => {
    let letter = "";
    let temp = index;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  const autoMapColumns = (headers: string[]) => {
    const mappings = {
      name: -1,
      serialNumber: -1,
      manufacturer: -1,
      model: -1,
      equipmentNo: -1,
      department: -1,
    };

    headers.forEach((header, index) => {
      const h = header.replace(/^"|"$/g, "").toLowerCase().trim();
      if (h.includes("ชื่อ") || h.includes("name") || h.includes("รายการ") || h.includes("เครื่องมือ")) {
        if (mappings.name === -1) mappings.name = index;
      } else if (h.includes("sn") || h.includes("s/n") || h.includes("serial") || h.includes("หมายเลขเครื่อง") || h.includes("ซีเรียล")) {
        if (mappings.serialNumber === -1) mappings.serialNumber = index;
      } else if (h.includes("brand") || h.includes("manufacturer") || h.includes("ยี่ห้อ") || h.includes("ผู้ผลิต") || h.includes("make")) {
        if (mappings.manufacturer === -1) mappings.manufacturer = index;
      } else if (h.includes("model") || h.includes("รุ่น")) {
        if (mappings.model === -1) mappings.model = index;
      } else if (h.includes("รหัสครุภัณฑ์") || h.includes("เลขครุภัณฑ์") || h.includes("ครุภัณฑ์") || h.includes("equipment")) {
        if (mappings.equipmentNo === -1) mappings.equipmentNo = index;
      } else if (h.includes("รพ.สต") || h.includes("โรงพยาบาล") || h.includes("แผนก") || h.includes("department") || h.includes("สังกัด") || h.includes("หน่วยงาน") || h.includes("location") || h.includes("สถานที่")) {
        if (mappings.department === -1) mappings.department = index;
      }
    });

    setFieldMappings(mappings);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFileName(file.name);
    setCsvError(null);
    setSuccessMessage(null);
    setDetectedHospitalName(null);

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            setCsvError("ไม่สามารถอ่านข้อมูลจากไฟล์ได้ หรือไฟล์ไม่มีข้อมูล");
            return;
          }

          const [pdfjsLib, workerModule] = await Promise.all([
            import("pdfjs-dist"),
            import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
          ]);
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
          const pdf = await loadingTask.promise;
          
          let fullPdfText = "";
          const rawRows: string[][] = [];

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Accumulate full text for hospital detection
            textContent.items.forEach((item: any) => {
              fullPdfText += " " + item.str;
            });

            // Group text items into rows based on y coordinate tolerance
            const items: any[] = textContent.items
              .map((item: any) => ({
                str: item.str,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width || 0,
                height: item.transform[0] || item.height || 10
              }))
              .filter(item => item.str.trim() !== "");

            const rowsList: any[][] = [];
            const yTolerance = 12; // Anchor-based tolerance, prevent drift

            // Sort items descending by y (top of page to bottom)
            items.sort((a, b) => b.y - a.y);

            items.forEach((item) => {
              let added = false;
              for (const row of rowsList) {
                // Compare with row[0].y (the first/anchor element of the row) to prevent drift
                if (Math.abs(row[0].y - item.y) <= yTolerance) {
                  row.push(item);
                  added = true;
                  break;
                }
              }
              if (!added) {
                rowsList.push([item]);
              }
            });

            // Reconstruct rows sorting items by x (left to right) and splitting columns by horizontal gaps
            rowsList.forEach((rowItems) => {
              rowItems.sort((a, b) => a.x - b.x);
              const columns: string[] = [];
              
              if (rowItems.length > 0) {
                let currentCell = rowItems[0].str;
                let lastX = rowItems[0].x;
                let lastWidth = rowItems[0].width;

                for (let i = 1; i < rowItems.length; i++) {
                  const item = rowItems[i];
                  const gap = item.x - (lastX + lastWidth);

                  // If gap <= 12 or start coordinate difference is very small (<= 15), treat as same column cell
                  if (gap <= 12 || (item.x - lastX) <= 15) {
                    if (currentCell.endsWith(" ") || item.str.startsWith(" ")) {
                      currentCell += item.str;
                    } else {
                      currentCell += " " + item.str;
                    }
                    lastWidth = (item.x + item.width) - lastX;
                  } else {
                    columns.push(currentCell.trim());
                    currentCell = item.str;
                    lastX = item.x;
                    lastWidth = item.width;
                  }
                }
                columns.push(currentCell.trim());
              }

              const filteredCols = columns.map(c => c.trim()).filter(c => c !== "");
              if (filteredCols.length > 0) {
                rawRows.push(filteredCols);
              }
            });
          }

          if (rawRows.length === 0) {
            setCsvError("ไม่พบข้อมูลตัวอักษรใดๆ ในไฟล์ PDF");
            return;
          }

          // Filter rows that have at least some data
          const dataRows = rawRows.filter(row => row.length > 1 || (row.length === 1 && row[0].length > 10));
          
          if (dataRows.length === 0) {
            setCsvError("ไม่พบข้อมูลตารางครุภัณฑ์ใดๆ ในไฟล์ PDF");
            return;
          }

          // Detect hospital from full text & filename
          const detectedHosp = detectHospital(file.name, fullPdfText);
          setDetectedHospitalName(detectedHosp);

          // Apply processAndSplitRow on all extracted rows
          const processedRows = dataRows.map(row => processAndSplitRow(row)).filter(row => row.length > 0);

          let headers: string[] = [];
          let finalDataRows: string[][] = [];

          if (processedRows.length > 0) {
            headers = processedRows[0];
            finalDataRows = processedRows.slice(1);
          } else {
            setCsvError("เกิดข้อผิดพลาดในการประมวลผลตารางครุภัณฑ์");
            return;
          }

          setCsvHeaders(headers);
          setCsvRows(finalDataRows);

          // Auto-map the restructured 5 columns:
          // Column 0: "ที่" (Ignore/Skip)
          // Column 1: "ชื่อเครื่องมือแพทย์" (Name)
          // Column 2: "ยี่ห้อ (Manufacturer)" (Manufacturer)
          // Column 3: "รุ่น (Model)" (Model)
          // Column 4: "เลขครุภัณฑ์ (Equipment No)" (Equipment No)
          setFieldMappings({
            name: 1,
            serialNumber: -1,
            manufacturer: 2,
            model: 3,
            equipmentNo: 4,
            department: -1,
          });
        } catch (err: any) {
          console.error("PDF parse error:", err);
          setCsvError(`เกิดข้อผิดพลาดในการอ่านไฟล์ PDF: ${err.message || err}`);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          setCsvError("ไม่สามารถอ่านข้อมูลจากไฟล์ได้ หรือไฟล์ไม่มีข้อมูล");
          return;
        }

        const data = new Uint8Array(arrayBuffer);
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (jsonData.length === 0) {
          setCsvError("ไม่พบข้อมูลในไฟล์ หรือไฟล์ไม่มีข้อมูล");
          return;
        }

        const parsedRows = jsonData.filter(row => 
          row && row.length > 0 && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== "")
        );

        if (parsedRows.length === 0) {
          setCsvError("ไม่พบแถวข้อมูลใดๆ ในไฟล์");
          return;
        }

        const headers = parsedRows[0].map(h => String(h || "").trim());
        const dataRows = parsedRows.slice(1).map(row => 
          row.map(cell => cell === null || cell === undefined ? "" : String(cell).trim())
        );

        // Detect hospital name from file name and headers/data content
        let allExcelText = headers.join(" ");
        dataRows.slice(0, 10).forEach(row => {
          allExcelText += " " + row.join(" ");
        });
        const detectedHosp = detectHospital(file.name, allExcelText);
        setDetectedHospitalName(detectedHosp);

        setCsvHeaders(headers);
        setCsvRows(dataRows);
        autoMapColumns(headers);
      } catch (err: any) {
        setCsvError(`เกิดข้อผิดพลาดในการนำเข้าไฟล์: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = async () => {
    const templateHeaders = [
      "ชื่อเครื่องมือแพทย์ (Required)", 
      "หมายเลขเครื่อง (S/N)", 
      "ยี่ห้อ (Brand)", 
      "รุ่น (Model)", 
      "เลขครุภัณฑ์ (EquipmentNo)", 
      "รพ.สต. สังกัด"
    ];
    
    const sampleRows = [
      ["Oxygen Concentrator 5L", "SN-998822-OC", "Philips", "EverFlo", "OC-5L-01", "รพ.สต. ตัวอย่าง 02"],
      ["Defibrillator / AED", "SN-AED-12344", "Zoll", "AED Plus", "AED-Z-02", "รพ.สต. ตัวอย่าง 01"],
      ["Infusion Pump", "SN-IP-7732-F", "Terumo", "TE-171", "IP-T-11", "รพ.สต. ตัวอย่าง 03"],
      ["Weight Machine with Height", "SN-WS-1102", "Seca", "703", "WS-S-05", "รพ.สต. ตัวอย่าง 09"]
    ];

    const worksheetData = [templateHeaders, ...sampleRows];
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    XLSX.writeFile(workbook, "IPM_Import_Template.xlsx");
  };

  const handleConfirmImport = () => {
    if (fieldMappings.name === -1) {
      setCsvError("กรุณาเลือกคอลัมน์สำหรับ 'ชื่อเครื่องมือแพทย์ (Name)' เพื่อดำเนินการต่อ");
      return;
    }

    if (!onImportDevices) return;

    // Track active sequence counters for each (hospAbbr, devPrefix) combination
    const activeCounters: Record<string, number> = {};

    devices.forEach((d) => {
      if (!d.id) return;
      const parts = d.id.split("-");
      if (parts.length >= 3) {
        const hosp = parts[0].toUpperCase();
        const prefix = parts[1].toUpperCase();
        const seq = parseInt(parts[2], 10);
        if (hosp && prefix && !isNaN(seq)) {
          const key = `${hosp}-${prefix}`;
          if (!activeCounters[key] || seq > activeCounters[key]) {
            activeCounters[key] = seq;
          }
        }
      }
    });

    const todayStr = getTodayStrBE();
    const todayDateTimeStr = getTodayStrBE() + " 09:00";

    const newDevicesList: MedicalDevice[] = [];

    csvRows.forEach((row) => {
      const nameRaw = fieldMappings.name !== -1 && row[fieldMappings.name] ? row[fieldMappings.name].replace(/^"|"$/g, "").trim() : "";
      if (!nameRaw || nameRaw === "") return;

      // Detect the QA/IPM profile from the original CSV value before normalizing
      // the display name. This preserves distinctions such as AED vs Defibrillator.
      const deviceCategory = getChecklistCategory(nameRaw, nameRaw);
      const mappedName = mapThaiDeviceToEnglish(nameRaw);
      const name = deviceCategory === "General Medical Device"
        ? mappedName
        : CANONICAL_DEVICE_NAMES[deviceCategory];
      const checklistDefaults = createDefaultChecklistsForDevice(nameRaw, nameRaw);

      const serialNumber = fieldMappings.serialNumber !== -1 && row[fieldMappings.serialNumber] ? row[fieldMappings.serialNumber].replace(/^"|"$/g, "").trim() : "";
      const manufacturer = fieldMappings.manufacturer !== -1 && row[fieldMappings.manufacturer] ? row[fieldMappings.manufacturer].replace(/^"|"$/g, "").trim() : "";
      const model = fieldMappings.model !== -1 && row[fieldMappings.model] ? row[fieldMappings.model].replace(/^"|"$/g, "").trim() : "";
      const equipmentNo = fieldMappings.equipmentNo !== -1 && row[fieldMappings.equipmentNo] ? row[fieldMappings.equipmentNo].replace(/^"|"$/g, "").trim() : "";
      const departmentRaw = fieldMappings.department !== -1 && row[fieldMappings.department] ? row[fieldMappings.department].replace(/^"|"$/g, "").trim() : "";

      let matchedDept = selectedImportHospital || detectedHospitalName || HOSPITALS[0].name;
      if (fieldMappings.department !== -1 && departmentRaw) {
        const found = HOSPITALS.find(h => 
          h.name.toLowerCase().includes(departmentRaw.toLowerCase()) || 
          departmentRaw.toLowerCase().includes(h.name.toLowerCase())
        );
        if (found) {
          matchedDept = found.name;
        } else {
          const partial = HOSPITALS.find(h => {
            const hShort = h.name.replace("รพ.สต. ", "");
            return hShort.toLowerCase().includes(departmentRaw.toLowerCase()) || 
                   departmentRaw.toLowerCase().includes(hShort.toLowerCase());
          });
          if (partial) matchedDept = partial.name;
        }
      }

      // Calculate hospital abbreviation and device prefix to generate the sequential ID Code
      const hospAbbr = HOSPITAL_ABBREVIATIONS[matchedDept] || matchedDept.replace("รพ.สต. ", "").trim();
      const devPrefix = getPrefixForDevice(name);
      const key = `${hospAbbr}-${devPrefix}`.toUpperCase();

      const currentSeq = activeCounters[key] || 0;
      const nextSeq = currentSeq + 1;
      activeCounters[key] = nextSeq;

      const seqStr = nextSeq.toString().padStart(3, "0");
      const deviceId = `${hospAbbr}-${devPrefix}-${seqStr}`;
      const reportCode = `${devPrefix}-${seqStr}`;

      const newDevice: MedicalDevice = {
        id: deviceId,
        name: name,
        deviceType: name,
        equipmentNo: equipmentNo || `${deviceId}-A1`,
        department: matchedDept,
        location: matchedDept,
        manufacturer: manufacturer || "General Medical",
        model: model || "Standard Model",
        serialNumber: serialNumber || `SN-${deviceId}`,
        ipmRound: `1/${new Date().getFullYear() + 543}`,
        ipmDate: todayStr,
        ipmDueDate: "12 / 2026",
        ipmReport: reportCode,
        ipmTypes: ["New Equipment"],
        temperature: 25.0,
        humidity: 50.0,
        status: "Registration",
        workflowStep: 1,
        registrationDate: todayStr,
        ipmCheckResult: null,
        ipmCheckDate: null,
        ipmTester: null,
        ipmNotes: null,
        repairDetails: null,
        repairDate: null,
        repairCost: null,
        repairTechnician: null,
        certificateNo: null,
        certificateDate: null,
        approvedBy: null,
        ...checklistDefaults,
        history: [
          {
            date: todayDateTimeStr,
            action: "ลงทะเบียนขึ้นระบบ (CSV Import)",
            note: `ลงทะเบียนครุภัณฑ์การแพทย์เครื่องใหม่ผ่านการนำเข้าไฟล์ CSV (${csvFileName}) ประสบความสำเร็จ`,
            user: "ฝ่ายลงทะเบียน"
          }
        ]
      };

      newDevicesList.push(newDevice);
    });

    if (newDevicesList.length === 0) {
      setCsvError("ไม่พบข้อมูลอุปกรณ์แพทย์ที่ถูกต้องสำหรับนำเข้า (ตรวจสอบคอลัมน์ชื่อเครื่องมือแพทย์)");
      return;
    }

    onImportDevices(newDevicesList);
    setSuccessMessage(`นำเข้าครุภัณฑ์การแพทย์สำเร็จจำนวน ${newDevicesList.length} เครื่อง!`);
    
    setTimeout(() => {
      setShowImportModal(false);
      setCsvFileName(null);
      setCsvHeaders([]);
      setCsvRows([]);
      setCsvError(null);
      setSuccessMessage(null);
    }, 2000);
  };

  const getDeviceProvince = (device: MedicalDevice): "ตัวอย่างเหนือ" | "ตัวอย่างกลาง" | "อื่นๆ" => {
    let hosp = HOSPITALS.find((h) => h.name === device.location);
    if (!hosp) {
      hosp = HOSPITALS.find((h) => h.name === device.department);
    }
    return hosp ? hosp.province : "อื่นๆ";
  };

  const availableHospitals = HOSPITALS.filter(h => {
    if (selectedProvince === "ทั้งหมด") return true;
    return h.province === selectedProvince;
  });

  const filteredDevices = devices.filter((device) => {
    // Filter by Province first
    if (selectedProvince !== "ทั้งหมด") {
      if (getDeviceProvince(device) !== selectedProvince) return false;
    }
    // Filter by Hospital next
    if (selectedHospital !== "ทั้งหมด") {
      const isMatch = device.location === selectedHospital || device.department === selectedHospital;
      if (!isMatch) return false;
    }
    return true;
  });

  // Stats
  const totalCount = filteredDevices.length;
  const ipmCheckCount = filteredDevices.filter((d) => d.status === "IPM" || d.status === "Registration").length;
  const underRepairCount = filteredDevices.filter((d) => d.status === "Repair").length;

  const exportToExcel = async () => {
    const headers = [
      "ID Code",
      "เครื่อง", 
      "ยี่ห้อ", 
      "รุ่น", 
      "เลขครุภัณฑ์", 
      "S/N", 
      "วันที่ลงทะเบียน"
    ];

    const rows = filteredDevices.map((d) => [
      d.id,
      d.name, 
      d.manufacturer || "-", 
      d.model || "-", 
      d.equipmentNo || "-", 
      d.serialNumber || "-", 
      d.registrationDate || "-"
    ]);

    const worksheetData = [headers, ...rows];
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Registry");

    const provinceSuffix = selectedProvince === "ทั้งหมด"
      ? "All"
      : selectedProvince === "ตัวอย่างเหนือ"
        ? "SampleNorth"
        : "SampleCentral";
    XLSX.writeFile(workbook, `IPM_Asset_Registry_${provinceSuffix}_${getTodayStrBE().replace(/\//g, "-")}.xlsx`);
  };

  const fetchFontAsBase64 = async (url: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Failed to fetch font");
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  };

  const exportToPDF = async () => {
    setIsExportingPDF(true);
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      let hasThaiFont = false;
      try {
        const [regBase64, boldBase64] = await Promise.all([
          fetchFontAsBase64(sarabunRegularUrl),
          fetchFontAsBase64(sarabunBoldUrl)
        ]);

        doc.addFileToVFS("Sarabun-Regular.ttf", regBase64);
        doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
        
        doc.addFileToVFS("Sarabun-Bold.ttf", boldBase64);
        doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
        
        doc.setFont("Sarabun", "normal");
        hasThaiFont = true;
      } catch (fontErr) {
        console.error("Could not load Sarabun font, falling back to system fonts:", fontErr);
        doc.setFont("helvetica", "normal");
      }

      const headers = [
        "ID Code",
        "เครื่อง", 
        "ยี่ห้อ", 
        "รุ่น", 
        "เลขครุภัณฑ์", 
        "S/N", 
        "วันที่ลงทะเบียน"
      ];

      const rows = filteredDevices.map((d) => [
        d.id,
        d.name, 
        d.manufacturer || "-", 
        d.model || "-", 
        d.equipmentNo || "-", 
        d.serialNumber || "-", 
        d.registrationDate || "-"
      ]);

      const title = "รายงานรายชื่อครุภัณฑ์การแพทย์ (Medical Asset Registry Report)";
      const hospitalText = selectedHospital !== "ทั้งหมด" ? ` | รพ.สต.: ${selectedHospital}` : "";
      const subtitle = `จังหวัด: ${selectedProvince}${hospitalText} | ทั้งหมด ${totalCount} รายการ | วันที่ส่งออก: ${getTodayStrBE()}`;

      if (hasThaiFont) {
        doc.setFont("Sarabun", "bold");
        doc.setFontSize(14);
        doc.text(title, 14, 15);
        doc.setFont("Sarabun", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, 14, 21);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Medical Asset Registry Report", 14, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Province: ${selectedProvince === "ทั้งหมด" ? "All" : selectedProvince}${selectedHospital !== "ทั้งหมด" ? ` | Hosp: ${selectedHospital}` : ""} | Total: ${totalCount} items | Date: ${getTodayStrBE()}`, 14, 21);
      }

      autoTable(doc, {
        startY: 25,
        head: [headers],
        body: rows,
        styles: { 
          font: hasThaiFont ? "Sarabun" : "helvetica", 
          fontStyle: "normal",
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: { 
          font: hasThaiFont ? "Sarabun" : "helvetica", 
          fontStyle: "bold",
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 8.5,
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 55 },
          2: { cellWidth: 35 },
          3: { cellWidth: 35 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
          6: { cellWidth: 35 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          doc.setFont(hasThaiFont ? "Sarabun" : "helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `หน้า ${data.pageNumber} / ${pageCount}`, 
            doc.internal.pageSize.width - 20, 
            doc.internal.pageSize.height - 10,
            { align: "right" }
          );
        }
      });

      const provinceSuffix = selectedProvince === "ทั้งหมด"
        ? "All"
        : selectedProvince === "ตัวอย่างเหนือ"
          ? "SampleNorth"
          : "SampleCentral";
      doc.save(`IPM_Asset_Registry_${provinceSuffix}_${getTodayStrBE().replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setPdfError("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF โปรดลองอีกครั้ง");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6" id="registry-tab">
      {/* View Only Banner */}
      {!canEdit && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <span>คุณกำลังเข้าชมข้อมูลในโหมดผู้สังเกตการณ์ (View Only) เนื่องจากสิทธิ์การบันทึกข้อมูลถูกจำกัดไว้เฉพาะเจ้าหน้าที่ฝ่ายลงทะเบียนและผู้ดูแลระบบเท่านั้น</span>
        </div>
      )}

      {pdfError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600 shrink-0">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
          </svg>
          <span>{pdfError}</span>
        </div>
      )}

      {/* Tab Title Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            ฝ่ายลงทะเบียนครุภัณฑ์การแพทย์ (Asset Registry)
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            ระบบขึ้นทะเบียนรหัสครุภัณฑ์ กำหนดสังกัดแผนก รุ่น หมายเลขเครื่อง (Serial Number) และสติกเกอร์บาร์โค้ด
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            ส่งออกรายชื่อ (Excel)
          </button>
          <button
            onClick={() => {
              setPdfError(null);
              exportToPDF();
            }}
            disabled={isExportingPDF}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-50 hover:text-red-600 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExportingPDF ? (
              <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-slate-500 border-t-transparent"></span>
            ) : (
              <FileText className="h-3.5 w-3.5 text-red-500" />
            )}
            {isExportingPDF ? "กำลังสร้าง PDF..." : "ส่งออกรายชื่อ (PDF)"}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            disabled={!canEdit}
            className={`px-4 py-2 border text-xs font-semibold flex items-center gap-2 rounded-xl transition-all shadow-sm cursor-pointer ${
              canEdit 
                ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600" 
                : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
            }`}
            title={canEdit ? "นำเข้าข้อมูลจากไฟล์ Excel, CSV หรือ PDF" : "เฉพาะฝ่ายลงทะเบียนเท่านั้นที่สามารถนำเข้าข้อมูลได้"}
          >
            <Upload className="h-3.5 w-3.5" />
            นำเข้าข้อมูล (Excel / CSV / PDF)
          </button>
          <button
            onClick={onOpenRegisterForm}
            disabled={!canEdit}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
              canEdit 
                ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer" 
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
            }`}
            title={canEdit ? "ลงทะเบียนเครื่องใหม่" : "เฉพาะฝ่ายลงทะเบียนเท่านั้นที่สามารถลงทะเบียนได้"}
          >
            {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
            {canEdit && <Plus className="h-3.5 w-3.5" />}
            ลงทะเบียนเครื่องใหม่
          </button>
        </div>
      </div>

      {/* Registry KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ครุภัณฑ์ทั้งหมดในระบบ</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {totalCount} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-sm font-bold">
            &Sigma;
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ส่งตรวจเช็ค IPM</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {ipmCheckCount} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ชำรุดรอซ่อมบำรุง</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {underRepairCount} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Asset List Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="asset-registry-card">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              ทะเบียนประวัติข้อมูลเครื่องมือแพทย์
            </h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              แสดงรายการครุภัณฑ์ทางการแพทย์แยกตามสาขาและพื้นที่จังหวัดเพื่อความสะดวกในการจัดการ
            </p>
          </div>

          {/* Province & Hospital Selectors */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 self-start sm:self-auto w-full sm:w-auto">
            {/* Segmented control for Province switching */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
              {[
                { id: "ทั้งหมด", label: "ทั้งหมด" },
                { id: "ตัวอย่างเหนือ", label: "ตัวอย่างเหนือ" },
                { id: "ตัวอย่างกลาง", label: "ตัวอย่างกลาง" }
              ].map((p) => {
                const isActive = selectedProvince === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProvince(p.id as any);
                      setSelectedHospital("ทั้งหมด");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial ${
                      isActive
                        ? "bg-white text-blue-600 shadow-sm border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/30"
                    }`}
                  >
                    <MapPin className={`h-3 w-3 ${isActive ? "text-blue-500 animate-pulse" : "text-slate-400"}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector for Hospital */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 w-full sm:w-64">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">รพ.สต.:</span>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="bg-transparent border-none p-0 w-full font-bold text-xs text-slate-700 focus:ring-0 focus:outline-none cursor-pointer outline-none"
              >
                <option value="ทั้งหมด">ทั้งหมด รพ.สต.</option>
                {availableHospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.name}>
                    {hosp.name} {hosp.province ? `(จ.${hosp.province})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">รหัส IPM / อ้างอิง</th>
                <th className="py-4 px-3">ชื่อครุภัณฑ์</th>
                <th className="py-4 px-3">รหัสครุภัณฑ์</th>
                <th className="py-4 px-3">รพ.สต. / แผนก</th>
                <th className="py-4 px-3">ผู้ผลิต / รุ่น</th>
                <th className="py-4 px-3 text-center">จัดการประวัติ</th>
                <th className="py-4 px-6 text-center">เริ่มงาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MapPin className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 font-bold">ไม่พบข้อมูลครุภัณฑ์ทางการแพทย์ในพื้นที่จังหวัด{selectedProvince}</p>
                      <p className="text-[11px] text-slate-400">กรุณาเลือกจังหวัดอื่นหรือลงทะเบียนครุภัณฑ์เพิ่มเติมในจังหวัดนี้</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  const isHospital = (name: string) => HOSPITALS.some((h) => h.name === name);
                  const displayHospital = isHospital(device.location) 
                    ? device.location 
                    : isHospital(device.department) 
                      ? device.department 
                      : device.location || "-";

                  const displayDept = isHospital(device.location)
                    ? device.department
                    : isHospital(device.department)
                      ? (device.location || "")
                      : device.department || "-";

                  return (
                    <tr 
                      key={device.id} 
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      {/* ID column */}
                      <td className="py-4 px-6 font-mono font-bold text-blue-600 whitespace-nowrap">
                        <button
                          onClick={() => onOpenDeviceDetail(device.id)}
                          className="hover:underline text-left cursor-pointer"
                          title="ดูข้อมูลประวัติโดยละเอียด"
                        >
                          {device.id}
                        </button>
                      </td>

                      {/* Name column */}
                      <td className="py-4 px-3 font-semibold text-slate-800">
                        <div>
                          <p>{device.name}</p>
                        </div>
                      </td>

                      {/* Code column */}
                      <td className="py-4 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {device.equipmentNo}
                      </td>

                      {/* Dept/Location column */}
                      <td className="py-4 px-3">
                        <div>
                          <p className="font-medium text-slate-800">{displayHospital}</p>
                          {displayDept && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded">
                              {displayDept}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Manufacturer/Model */}
                      <td className="py-4 px-3 text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-800">{device.manufacturer}</p>
                          <p className="text-[10px] font-mono text-slate-400">{device.model}</p>
                        </div>
                      </td>



                      {/* Edit History Actions */}
                      <td className="py-4 px-3 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => onEditDevice(device.id)}
                                className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                                title="แก้ไขข้อมูลครุภัณฑ์"
                              >
                                <Edit2 className="h-3 w-3" />
                                แก้ไขข้อมูลเครื่อง
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteDevice(device.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="ลบครุภัณฑ์ออกจากระบบ"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center justify-center gap-1 text-slate-400 bg-slate-50 px-2 py-1 rounded text-[10px] border border-slate-100">
                              <Lock className="h-3 w-3" />
                              <span>สิทธิ์ถูกจำกัด</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Start workflow check button */}
                      <td className="py-4 px-6 whitespace-nowrap text-center">
                        {device.status === "Registration" ? (
                          canEdit ? (
                            <button
                              onClick={() => onSendToIPM(device.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all w-full justify-center cursor-pointer"
                            >
                              <span>ส่งตรวจเช็ค IPM</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold w-full bg-slate-100 text-slate-400 border border-slate-200">
                              <Lock className="h-3 w-3" />
                              <span>รอส่งตรวจเช็ค</span>
                            </span>
                          )
                        ) : (
                          <span className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-semibold w-full justify-center ${
                            device.status === "IPM"
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : device.status === "Repair"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}>
                            {device.status === "IPM" 
                              ? "รอตรวจเช็ค QA" 
                              : device.status === "Repair" 
                                ? "ชำรุดรอซ่อม" 
                                : "ผ่านตรวจเช็คเสร็จสิ้น"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV IMPORT POPUP MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">นำเข้าข้อมูลครุภัณฑ์การแพทย์ (Excel / CSV / PDF)</h3>
                  <p className="text-xs text-slate-400">อัปโหลดไฟล์ตารางรายชื่อ หรือเอกสาร PDF เพื่อลงทะเบียนเครื่องเข้าระบบพร้อมกัน</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFileName(null);
                  setCsvHeaders([]);
                  setCsvRows([]);
                  setCsvError(null);
                  setSuccessMessage(null);
                }}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Success Alert */}
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Alert */}
              {csvError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold">
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>{csvError}</span>
                </div>
              )}

              {/* Step 1: No file selected */}
              {!csvFileName ? (
                <div className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-emerald-50/5">
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv, .pdf" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <Upload className="h-10 w-10 text-slate-400 mb-3" />
                    <span className="text-sm font-bold text-slate-700">คลิกเพื่อเลือกไฟล์ Excel / CSV / PDF หรือลากมาวางที่นี่</span>
                    <span className="text-xs text-slate-400 mt-1">รองรับไฟล์ตาราง .xlsx, .xls, .csv และเอกสาร PDF (.pdf)</span>
                  </label>

                  {/* Guides and Template Download */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700">แนะนำการใช้รูปแบบเทมเพลต:</span>
                      <button 
                        onClick={downloadTemplate}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 hover:underline cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        ดาวน์โหลดเทมเพลตตัวอย่าง (.xlsx)
                      </button>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4 leading-relaxed">
                      <li>คอลัมน์ <strong className="text-slate-700">ชื่อเครื่องมือแพทย์</strong> เป็นข้อมูลบังคับที่จำเป็นต้องมี</li>
                      <li>คอลัมน์อื่นๆ เช่น หมายเลขเครื่อง, ยี่ห้อ, รุ่น, และ สังกัด รพ.สต. จะถูกตรวจจับและเชื่อมโยงข้อมูลให้อัตโนมัติ</li>
                      <li>หากสังกัด รพ.สต. ในตารางไม่ตรงกับโรงพยาบาลในระบบ ระบบจะเลือก รพ.สต. แรกลงทะเบียนเริ่มต้นให้โดยอัตโนมัติ</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Step 2: File selected, mapping and preview */
                <div className="space-y-6">
                  {/* Selected File Card */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 line-clamp-1">{csvFileName}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[10px] text-slate-400 font-mono">พบทั้งหมด {csvRows.length} แถวข้อมูล</p>
                          {detectedHospitalName && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                              <MapPin className="h-2.5 w-2.5 shrink-0 text-indigo-500" />
                              รพ.สต. ตรวจพบ: {detectedHospitalName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setCsvFileName(null);
                        setCsvHeaders([]);
                        setCsvRows([]);
                        setCsvError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      เปลี่ยนไฟล์
                    </button>
                  </div>

                  {/* Spreadsheet Grid Preview */}
                  <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                        <Table className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                        ตัวอย่างโครงสร้างไฟล์ (Spreadsheet Raw Preview - พิกัด A B C / 1 2 3)
                      </h4>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">มุมมองตารางจำลอง</span>
                    </div>
                    
                    <div className="overflow-x-auto border border-slate-150 rounded-xl max-h-[300px] shadow-inner bg-slate-50/50">
                      <table className="w-full text-left border-collapse font-sans text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200">
                            <th className="p-2 bg-slate-200 text-slate-500 text-center font-mono font-bold border-r border-slate-300 w-20 text-[10px] sticky top-0 left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                              แถว (Row)
                            </th>
                            {csvHeaders.map((_, i) => {
                              const isMapped = fieldMappings.name === i || fieldMappings.serialNumber === i || fieldMappings.manufacturer === i || fieldMappings.model === i || fieldMappings.equipmentNo === i || fieldMappings.department === i;
                              return (
                                <th key={i} className={`p-2 border-r border-slate-200 min-w-[180px] text-center text-[11px] sticky top-0 transition-colors z-10 ${isMapped ? "bg-slate-100" : "bg-slate-50"}`}>
                                  <div className="flex flex-col items-center gap-1.5 py-1">
                                    <span className="text-xs font-mono font-black text-slate-800 bg-slate-200/80 px-2.5 py-0.5 rounded border border-slate-300 shadow-sm">
                                      คอลัมน์ {getExcelColLetter(i)}
                                    </span>
                                    
                                    <select
                                      value={
                                        fieldMappings.name === i ? "name" :
                                        fieldMappings.serialNumber === i ? "serialNumber" :
                                        fieldMappings.manufacturer === i ? "manufacturer" :
                                        fieldMappings.model === i ? "model" :
                                        fieldMappings.equipmentNo === i ? "equipmentNo" :
                                        fieldMappings.department === i ? "department" : "none"
                                      }
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setFieldMappings(prev => {
                                          const next = { ...prev };
                                          // Reset any previous fields mapped to this index
                                          if (next.name === i) next.name = -1;
                                          if (next.serialNumber === i) next.serialNumber = -1;
                                          if (next.manufacturer === i) next.manufacturer = -1;
                                          if (next.model === i) next.model = -1;
                                          if (next.equipmentNo === i) next.equipmentNo = -1;
                                          if (next.department === i) next.department = -1;

                                          if (val === "name") next.name = i;
                                          else if (val === "serialNumber") next.serialNumber = i;
                                          else if (val === "manufacturer") next.manufacturer = i;
                                          else if (val === "model") next.model = i;
                                          else if (val === "equipmentNo") next.equipmentNo = i;
                                          else if (val === "department") next.department = i;

                                          return next;
                                        });
                                      }}
                                      className={`w-full text-[10.5px] px-1.5 py-1 rounded-lg border font-semibold outline-none transition-all cursor-pointer ${
                                        fieldMappings.name === i ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold" :
                                        fieldMappings.serialNumber === i ? "bg-blue-50 border-blue-300 text-blue-800 font-bold" :
                                        fieldMappings.manufacturer === i ? "bg-purple-50 border-purple-300 text-purple-800 font-bold" :
                                        fieldMappings.model === i ? "bg-amber-50 border-amber-300 text-amber-800 font-bold" :
                                        fieldMappings.equipmentNo === i ? "bg-yellow-50 border-yellow-300 text-yellow-800 font-bold" :
                                        fieldMappings.department === i ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-bold" :
                                        "bg-white border-slate-200 text-slate-500 hover:border-slate-300 focus:border-slate-400"
                                      }`}
                                    >
                                      <option value="none">-- ข้ามคอลัมน์นี้ --</option>
                                      <option value="name" className="text-emerald-700 font-bold">★ ชื่อเครื่องมือแพทย์ *</option>
                                      <option value="serialNumber" className="text-blue-700 font-medium">S/N (หมายเลขเครื่อง)</option>
                                      <option value="manufacturer" className="text-purple-700 font-medium">ยี่ห้อ (Manufacturer)</option>
                                      <option value="model" className="text-amber-700 font-medium">รุ่น (Model)</option>
                                      <option value="equipmentNo" className="text-yellow-700 font-medium">เลขครุภัณฑ์ (Equip No)</option>
                                      <option value="department" className="text-indigo-700 font-medium">สังกัด รพ.สต.</option>
                                    </select>
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row 1 (Header row of original file) */}
                          <tr className="border-b border-slate-150 hover:bg-slate-50/40">
                            <td className="p-2 bg-slate-100 text-slate-500 text-center font-mono font-black border-r border-slate-300 text-[11px] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                              1 (หัวข้อ)
                            </td>
                            {csvHeaders.map((h, i) => {
                              const isMappedName = fieldMappings.name === i;
                              const isMappedSN = fieldMappings.serialNumber === i;
                              const isMappedMfg = fieldMappings.manufacturer === i;
                              const isMappedModel = fieldMappings.model === i;
                              const isMappedEquip = fieldMappings.equipmentNo === i;
                              const isMappedDept = fieldMappings.department === i;
                              
                              let bgClass = "bg-white text-slate-800";
                              if (isMappedName) bgClass = "bg-emerald-50/30 text-emerald-900 font-bold border-emerald-100/50";
                              else if (isMappedSN) bgClass = "bg-blue-50/30 text-blue-900 font-bold border-blue-100/50";
                              else if (isMappedMfg) bgClass = "bg-purple-50/30 text-purple-900 font-bold border-purple-100/50";
                              else if (isMappedModel) bgClass = "bg-amber-50/30 text-amber-900 font-bold border-amber-100/50";
                              else if (isMappedEquip) bgClass = "bg-yellow-50/30 text-yellow-900 font-bold border-yellow-100/50";
                              else if (isMappedDept) bgClass = "bg-indigo-50/30 text-indigo-900 font-bold border-indigo-100/50";

                              return (
                                <td key={i} className={`p-2 border-r border-slate-150 truncate max-w-[180px] font-sans text-[11px] transition-colors ${bgClass}`} title={h}>
                                  {h ? h.replace(/^"|"$/g, "") : <span className="text-slate-300 italic">ว่าง</span>}
                                </td>
                              );
                            })}
                          </tr>
                          
                          {/* Rows 2+: Data rows */}
                          {csvRows.slice(0, 5).map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-b border-slate-150 hover:bg-slate-50/40">
                              <td className="p-2 bg-slate-100 text-slate-500 text-center font-mono font-black border-r border-slate-300 text-[11px] sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                {rowIdx + 2}
                              </td>
                              {csvHeaders.map((_, colIdx) => {
                                const val = row[colIdx];
                                const isMappedName = fieldMappings.name === colIdx;
                                const isMappedSN = fieldMappings.serialNumber === colIdx;
                                const isMappedMfg = fieldMappings.manufacturer === colIdx;
                                const isMappedModel = fieldMappings.model === colIdx;
                                const isMappedEquip = fieldMappings.equipmentNo === colIdx;
                                const isMappedDept = fieldMappings.department === colIdx;
                                
                                let bgClass = "bg-white text-slate-600";
                                if (isMappedName) bgClass = "bg-emerald-50/20 text-emerald-900 font-semibold border-emerald-100/30";
                                else if (isMappedSN) bgClass = "bg-blue-50/20 text-blue-900 border-blue-100/30";
                                else if (isMappedMfg) bgClass = "bg-purple-50/20 text-purple-900 border-purple-100/30";
                                else if (isMappedModel) bgClass = "bg-amber-50/20 text-amber-900 border-amber-100/30";
                                else if (isMappedEquip) bgClass = "bg-yellow-50/20 text-yellow-900 border-yellow-100/30";
                                else if (isMappedDept) bgClass = "bg-indigo-50/20 text-indigo-900 border-indigo-100/30";

                                return (
                                  <td key={colIdx} className={`p-2 border-r border-slate-150 font-mono truncate max-w-[180px] text-[11px] transition-colors ${bgClass}`} title={val}>
                                    {val ? val.replace(/^"|"$/g, "") : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Column Mapping Section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-emerald-500" />
                      การจับคู่คอลัมน์ข้อมูล (Column Mapping Matcher)
                    </h4>
                    <p className="text-[11px] text-slate-400">กรุณาตรวจสอบว่าข้อมูลคอลัมน์ในไฟล์อัปโหลดของท่าน ตรงกับข้อมูลที่จะบันทึกเข้าระบบหรือไม่</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80">
                      {/* Name Mapping (Required) */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700 flex items-center gap-1">
                          ชื่อเครื่องมือแพทย์ <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <select
                          value={fieldMappings.name}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, name: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ (ข้าม) --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* S/N Mapping */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700">หมายเลขเครื่อง (Serial Number)</label>
                        <select
                          value={fieldMappings.serialNumber}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, serialNumber: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ (ระบบจะสุ่มให้อัตโนมัติ) --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Manufacturer Mapping */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700">ยี่ห้อ (Manufacturer)</label>
                        <select
                          value={fieldMappings.manufacturer}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, manufacturer: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Model Mapping */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700">รุ่น (Model)</label>
                        <select
                          value={fieldMappings.model}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, model: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Equipment No Mapping */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700">เลขครุภัณฑ์ (Equipment No)</label>
                        <select
                          value={fieldMappings.equipmentNo}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, equipmentNo: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ (ระบบจะสร้างให้อัตโนมัติ) --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Department Mapping */}
                      <div className="space-y-1 text-xs">
                        <label className="font-bold text-slate-700">รพ.สต. สังกัด (Hospital)</label>
                        <select
                          value={fieldMappings.department}
                          onChange={(e) => setFieldMappings(prev => ({ ...prev, department: parseInt(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:border-emerald-500 outline-none"
                        >
                          <option value={-1}>-- ไม่ได้จับคู่ (เลือก รพ.สต. ที่มีด้วยตัวเอง) --</option>
                          {csvHeaders.map((h, i) => (
                            <option key={i} value={i}>
                              คอลัมน์ {getExcelColLetter(i)} ({i + 1}) - {h.replace(/^"|"$/g, "") || "ไม่มีหัวตาราง"}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Explicit Target Hospital Selector */}
                      {fieldMappings.department === -1 && (
                        <div className="space-y-1.5 text-xs md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 animate-fade-in mt-1">
                          <label className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 animate-bounce" />
                            เลือก รพ.สต. ที่มีในระบบเพื่อบันทึกข้อมูลเข้า:
                          </label>
                          <select
                            value={selectedImportHospital}
                            onChange={(e) => setSelectedImportHospital(e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2.5 font-bold text-indigo-800 focus:border-indigo-500 outline-none cursor-pointer shadow-sm"
                          >
                            {HOSPITALS.map((h) => (
                              <option key={h.id} value={h.name}>
                                [{h.province}] {h.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-indigo-500/80 font-medium">
                            * ข้อมูลครุภัณฑ์ในตารางจะอิมพอร์ตเข้าสู่รายชื่อ รพ.สต. ที่ระบุด้านบนนี้โดยตรงทั้งหมด
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mapped Live Preview table (First 3 items) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-700">ตัวอย่างข้อมูลที่จะอิมพอร์ต (Live Preview - 3 รายการแรก)</h4>
                    </div>
                    <div className="border border-slate-150 rounded-xl overflow-hidden text-[10px] bg-slate-50/20">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                            <th className="p-2 w-10 text-center">แถว</th>
                            <th className="p-2">ชื่อเครื่องมือแพทย์</th>
                            <th className="p-2 w-24">หมายเลขเครื่อง</th>
                            <th className="p-2 w-28">รพ.สต. สังกัด</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvRows.slice(0, 3).map((row, idx) => {
                            const name = fieldMappings.name !== -1 && row[fieldMappings.name] ? row[fieldMappings.name] : "";
                            const sn = fieldMappings.serialNumber !== -1 && row[fieldMappings.serialNumber] ? row[fieldMappings.serialNumber] : "";
                            const dept = fieldMappings.department !== -1 && row[fieldMappings.department] ? row[fieldMappings.department] : "";
                            
                            return (
                              <tr key={idx} className="border-b border-slate-100">
                                <td className="p-2 text-center text-slate-400 font-mono font-bold">{idx + 2}</td>
                                <td className="p-2 font-bold text-slate-800 truncate max-w-[150px]">
                                  {name ? name.replace(/^"|"$/g, "") : <span className="text-rose-500 italic">ไม่มีข้อมูล (แถวนี้จะถูกข้าม)</span>}
                                </td>
                                <td className="p-2 font-mono text-slate-600 truncate max-w-[90px]">
                                  {sn ? sn.replace(/^"|"$/g, "") : <span className="text-slate-300 italic">สร้างสุ่ม</span>}
                                </td>
                                <td className="p-2 text-slate-600 truncate max-w-[120px]">
                                  {dept ? dept.replace(/^"|"$/g, "") : <span className="text-indigo-600 font-semibold">{selectedImportHospital}</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button 
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFileName(null);
                  setCsvHeaders([]);
                  setCsvRows([]);
                  setCsvError(null);
                  setSuccessMessage(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              {csvFileName && (
                <button 
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={fieldMappings.name === -1 || !!successMessage}
                  className={`px-5 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md ${
                    fieldMappings.name !== -1 && !successMessage
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 cursor-pointer" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  ยืนยันนำเข้าข้อมูล ({csvRows.length} เครื่อง)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
