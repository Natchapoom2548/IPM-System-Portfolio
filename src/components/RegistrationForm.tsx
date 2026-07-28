/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle, 
  ChevronRight,
  Info,
  Lock
} from "lucide-react";
import { DEVICE_TEMPLATES, DEPARTMENTS, HOSPITALS } from "../data/mockData";
import { MedicalDevice, DeviceTemplate } from "../types";
import { 
  getTodayDateTimeStrBE, 
  getTodayStrBE, 
  getPrefixForDevice, 
  generateNextReportCodeForPrefix 
} from "../utils/dateUtils";

const SAMPLE_NORTH_TEMPLATES: DeviceTemplate[] = [
  { name: "NIBP", deviceType: "NIBP", manufacturer: "A&D Medical", model: "TM-2657P" },
  { name: "Sphygmomanometer", deviceType: "Sphygmomanometer", manufacturer: "HEINE", model: "GAMMA G5" },
  { name: "O2 Concentrator", deviceType: "O2 Concentrator", manufacturer: "Yuwell", model: "8F-5AW" },
  { name: "Patient Monitor", deviceType: "Patient Monitor", manufacturer: "Mindray", model: "uMEC10" },
  { name: "Pulse Oximeter", deviceType: "Pulse Oximeter", manufacturer: "Masimo", model: "Rad-97" },
  { name: "AED", deviceType: "AED", manufacturer: "Zoll", model: "AED Plus" },
  { name: "Defibrillator", deviceType: "Defibrillator", manufacturer: "Philips", model: "HeartStart" },
  { name: "Doptone", deviceType: "Doptone", manufacturer: "Huntleigh", model: "D900" },
  { name: "ECG", deviceType: "ECG", manufacturer: "Schiller", model: "Cardiovit" },
  { name: "Centrifuge", deviceType: "Centrifuge", manufacturer: "Hettich", model: "EBA 200" },
  { name: "Weight Machine", deviceType: "Weight Machine", manufacturer: "Seca", model: "762" },
  { name: "Syringe Pump", deviceType: "Syringe Pump", manufacturer: "Terumo", model: "TE-331" },
  { name: "Infusion Pump", deviceType: "Infusion Pump", manufacturer: "Terumo", model: "TE-171" },
  { name: "Ventilator", deviceType: "Ventilator", manufacturer: "Puritan Bennett", model: "840" },
  { name: "Thermometer", deviceType: "Thermometer", manufacturer: "Omron", model: "MC-246" },
  { name: "Infrared Thermo", deviceType: "Infrared Thermo", manufacturer: "Yuwell", model: "YT-1" },
  { name: "Refrigerator Thermometer", deviceType: "Refrigerator Thermometer", manufacturer: "LogTag", model: "UTRED30" },
  { name: "ESA", deviceType: "ESA", manufacturer: "Fluke Biomedical", model: "ESA615" },
  { name: "Others", deviceType: "Others", manufacturer: "Generic", model: "Standard" }
];

const SAMPLE_CENTRAL_TEMPLATES: DeviceTemplate[] = [
  { name: "NIBP", deviceType: "NIBP", manufacturer: "A&D Medical", model: "TM-2657P" },
  { name: "Sphygmomanometer", deviceType: "Sphygmomanometer", manufacturer: "HEINE", model: "GAMMA G5" },
  { name: "O2 Concentrator", deviceType: "O2 Concentrator", manufacturer: "Yuwell", model: "8F-5AW" },
  { name: "Patient Monitor", deviceType: "Patient Monitor", manufacturer: "Mindray", model: "uMEC10" },
  { name: "Pulse Oximeter", deviceType: "Pulse Oximeter", manufacturer: "Masimo", model: "Rad-97" },
  { name: "AED", deviceType: "AED", manufacturer: "Zoll", model: "AED Plus" },
  { name: "Defibrillator", deviceType: "Defibrillator", manufacturer: "Philips", model: "HeartStart" },
  { name: "Doptone", deviceType: "Doptone", manufacturer: "Huntleigh", model: "D900" },
  { name: "ECG", deviceType: "ECG", manufacturer: "Schiller", model: "Cardiovit" },
  { name: "Centrifuge", deviceType: "Centrifuge", manufacturer: "Hettich", model: "EBA 200" },
  { name: "Weight Machine", deviceType: "Weight Machine", manufacturer: "Seca", model: "762" },
  { name: "Syringe Pump", deviceType: "Syringe Pump", manufacturer: "Terumo", model: "TE-331" },
  { name: "Infusion Pump", deviceType: "Infusion Pump", manufacturer: "Terumo", model: "TE-171" },
  { name: "Ventilator", deviceType: "Ventilator", manufacturer: "Puritan Bennett", model: "840" },
  { name: "Thermometer", deviceType: "Thermometer", manufacturer: "Omron", model: "MC-246" },
  { name: "Infrared Thermo", deviceType: "Infrared Thermo", manufacturer: "Yuwell", model: "YT-1" },
  { name: "Refrigerator Thermometer", deviceType: "Refrigerator Thermometer", manufacturer: "LogTag", model: "UTRED30" },
  { name: "ESA", deviceType: "ESA", manufacturer: "Fluke Biomedical", model: "ESA615" },
  { name: "Others", deviceType: "Others", manufacturer: "Generic", model: "Standard" }
];

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

interface RegistrationFormProps {
  onCancel: () => void;
  onSubmit: (device: MedicalDevice) => void;
  devices: MedicalDevice[];
  editDevice?: MedicalDevice;
  userRole?: string;
}

export default function RegistrationForm({ 
  onCancel, 
  onSubmit, 
  devices,
  editDevice,
  userRole = "admin"
}: RegistrationFormProps) {
  const canEdit = userRole === "admin" || userRole === "registration";

  // Selection of template
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string>("");

  // Fields state
  const [equipmentName, setEquipmentName] = useState(editDevice ? editDevice.name : "");
  
  const [departmentId, setDepartmentId] = useState(editDevice ? editDevice.department : (HOSPITALS[0]?.name || ""));
  const [idCode, setIdCode] = useState(editDevice ? editDevice.id : "");
  const [equipmentNo, setEquipmentNo] = useState(editDevice ? editDevice.equipmentNo : "");
  const [ipmRound, setIpmRound] = useState(editDevice ? editDevice.ipmRound : `1/${new Date().getFullYear() + 543}`);
  const [ipmDate, setIpmDate] = useState(editDevice ? editDevice.ipmDate : "04/07/2569");
  const [ipmDueDate, setIpmDueDate] = useState(editDevice ? editDevice.ipmDueDate : "01 / 2570");
  const [manufacturer, setManufacturer] = useState(editDevice ? editDevice.manufacturer : "");
  const [model, setModel] = useState(editDevice ? editDevice.model : "");
  const [serialNumber, setSerialNumber] = useState(editDevice ? editDevice.serialNumber : "");
  const [location, setLocation] = useState(editDevice ? editDevice.location : "");
  const [ipmReport, setIpmReport] = useState(editDevice ? editDevice.ipmReport : "");

  // IPM Info checkboxes
  const [ipmTypes, setIpmTypes] = useState<string[]>(editDevice ? editDevice.ipmTypes : ["New Equipment"]);
  const [temperature, setTemperature] = useState(editDevice ? String(editDevice.temperature) : "24.2");
  const [humidity, setHumidity] = useState(editDevice ? String(editDevice.humidity) : "52.5");

  // Find current province from selected hospital (departmentId)
  const selectedHosp = HOSPITALS.find((h) => h.name === departmentId);
  const currentProvince = selectedHosp ? selectedHosp.province : "ตัวอย่างเหนือ";

  const [formError, setFormError] = useState<string | null>(null);

  const currentTemplates = currentProvince === "ตัวอย่างกลาง"
    ? SAMPLE_CENTRAL_TEMPLATES
    : SAMPLE_NORTH_TEMPLATES;

  const autoGenerateIds = (dept: string, template: DeviceTemplate) => {
    if (editDevice) return;

    // 1. Get hospital abbreviation
    const hospAbbr = HOSPITAL_ABBREVIATIONS[dept] || dept.replace("รพ.สต. ", "").trim();

    // 2. Get device prefix
    const devPrefix = getPrefixForDevice(template.name);

    // 3. Find next sequential number for this specific hospital + device combination
    const regex = new RegExp(`^${hospAbbr}-${devPrefix}-(\\d+)`, 'i');
    const numbers = devices.map((d) => {
      const match = d.id ? d.id.match(regex) : null;
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextNum = maxNum + 1;
    const seqStr = nextNum.toString().padStart(3, "0");

    // 4. Set generated values
    const generatedId = `${hospAbbr}-${devPrefix}-${seqStr}`;
    setIdCode(generatedId);
    
    const generatedReport = `${devPrefix}-${seqStr}`;
    setIpmReport(generatedReport);
  };

  const handleTemplateChange = (idxStr: string) => {
    setSelectedTemplateIndex(idxStr);
    if (idxStr === "") {
      setEquipmentName("");
      setManufacturer("");
      setModel("");
      setIdCode("");
      setIpmReport("");
      return;
    }

    const idx = parseInt(idxStr);
    const template = currentTemplates[idx];
    setEquipmentName(template.name);
    
    // Manufacturer and Model must be typed manually
    setManufacturer("");
    setModel("");

    // Equipment No. and Serial Number must be typed manually
    setEquipmentNo("");
    setSerialNumber("");
    
    // Choose department location from current province
    const provinceHospitals = HOSPITALS.filter(h => h.province === currentProvince);
    let newDeptId = departmentId;
    if (provinceHospitals.length > 0) {
      const defaultHosp = provinceHospitals[idx % provinceHospitals.length];
      newDeptId = defaultHosp.name;
      setDepartmentId(newDeptId);
    }
    setLocation("");

    // Auto-generate ID Code and IPM Report
    autoGenerateIds(newDeptId, template);
  };

  const handleIpmTypeCheckbox = (type: string, checked: boolean) => {
    if (checked) {
      setIpmTypes([...ipmTypes, type]);
    } else {
      setIpmTypes(ipmTypes.filter((t) => t !== type));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!equipmentName) {
      setFormError("กรุณาระบุชื่อครุภัณฑ์การแพทย์");
      return;
    }
    if (!equipmentNo) {
      setFormError("กรุณาระบุรหัสครุภัณฑ์ (Equipment No)");
      return;
    }
    if (!serialNumber) {
      setFormError("กรุณาระบุหมายเลขเครื่อง (Serial Number)");
      return;
    }

    const savedDevice: MedicalDevice = editDevice ? {
      ...editDevice,
      id: idCode,
      name: equipmentName,
      deviceType: equipmentName,
      equipmentNo: equipmentNo,
      department: departmentId,
      location: location,
      manufacturer: manufacturer,
      model: model,
      serialNumber: serialNumber,
      ipmRound: ipmRound,
      ipmDate: ipmDate,
      ipmDueDate: ipmDueDate,
      ipmReport: ipmReport,
      ipmTypes: ipmTypes.length > 0 ? ipmTypes : ["New Equipment"],
      temperature: parseFloat(temperature) || 24.2,
      humidity: parseFloat(humidity) || 52.5,
      history: [
        {
          date: getTodayDateTimeStrBE(),
          action: "แก้ไขข้อมูลครุภัณฑ์",
          note: `แก้ไขรายละเอียดข้อมูลเครื่องในระบบ`,
          user: ""
        },
        ...editDevice.history
      ]
    } : {
      id: idCode,
      name: equipmentName,
      deviceType: equipmentName,
      equipmentNo: equipmentNo,
      department: departmentId,
      location: location,
      manufacturer: manufacturer,
      model: model,
      serialNumber: serialNumber,
      ipmRound: ipmRound,
      ipmDate: ipmDate,
      ipmDueDate: ipmDueDate,
      ipmReport: ipmReport,
      ipmTypes: ipmTypes.length > 0 ? ipmTypes : ["New Equipment"],
      temperature: parseFloat(temperature) || 24.2,
      humidity: parseFloat(humidity) || 52.5,
      status: "Registration",
      workflowStep: 1,
      registrationDate: getTodayStrBE(),
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
      history: [
        {
          date: getTodayDateTimeStrBE(),
          action: "ขึ้นทะเบียนครุภัณฑ์",
          note: `ลงทะเบียนเครื่องมือแพทย์ใหม่พร้อมรหัสรายงาน ${ipmReport} ภายใต้สังกัด ${departmentId}`,
          user: ""
        }
      ]
    };

    onSubmit(savedDevice);
  };

  return (
    <div className="space-y-6" id="registration-wizard">
      {!canEdit && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold max-w-4xl mx-auto">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <span>คุณกำลังเข้าชมข้อมูลในโหมดผู้สังเกตการณ์ (View Only) เนื่องจากสิทธิ์การบันทึกข้อมูลถูกจำกัดไว้เฉพาะเจ้าหน้าที่ฝ่ายลงทะเบียนและผู้ดูแลระบบเท่านั้น</span>
        </div>
      )}

      {/* Dynamic Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-5 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {editDevice 
              ? "แก้ไขข้อมูลเครื่องมือแพทย์ (Edit Medical Device)" 
              : "ฝ่ายลงทะเบียนครุภัณฑ์การแพทย์ - ลงทะเบียนเครื่องใหม่"}
          </h2>
          <p className="text-xs text-slate-500 font-sans mt-1">
            {editDevice 
              ? `แก้ไขรายละเอียดคุณสมบัติ ประวัติ และรหัสตรวจสอบของเครื่องมือแพทย์รหัส ${editDevice.id}`
              : "ระบบขึ้นทะเบียนรหัสครุภัณฑ์ กำหนดสังกัดแผนก รุ่น หมายเลขเครื่อง (Serial Number) และสติกเกอร์บาร์โค้ด"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-md space-y-6">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600 shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          {/* Template Dropdown Select */}
          <div className="p-5 bg-blue-50/40 border border-blue-100 rounded-2xl space-y-3 font-sans">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                </svg>
              </span>
              เลือกประเภทเครื่องมือแพทย์ที่ต้องการลงทะเบียน (Device Type) :
            </label>
            
            <select
              value={selectedTemplateIndex}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-500 text-xs rounded-xl outline-none text-slate-700 font-semibold"
            >
              <option value="">-- คลิกเลือกที่นี่เพื่อเลือกอุปกรณ์ --</option>
              {currentTemplates.map((tmpl, idx) => (
                <option key={idx} value={idx}>
                  {tmpl.name}
                </option>
              ))}
            </select>
            
            <p className="text-[10px] text-slate-400 italic">
              * ระบบจะเปลี่ยนชื่อครุภัณฑ์เป็นค่าเริ่มต้นของเครื่องมือนั้นๆ พร้อมรันเลขรหัสรายงาน <span className="text-blue-600 font-bold">IPM Report</span> ลำดับถัดไปให้อัตโนมัติ (เช่น BP-001, BP-002, ...)
            </p>
          </div>

          {/* Equipment Information List Style */}
          <div className="space-y-0.5 border border-slate-100 rounded-2xl p-6 bg-white shadow-sm font-sans">
            {/* Header info bar similar to image */}
            <div className="flex items-center gap-2 text-blue-800 pb-3 mb-4 border-b border-slate-100">
              <span className="text-blue-600 bg-blue-50 p-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </span>
              <span className="text-xs font-black tracking-wider uppercase">EQUIPMENT INFORMATION (ข้อมูลครุภัณฑ์)</span>
            </div>

            {/* Equipment Name */}
            <div className="flex items-center border-b border-slate-100 pb-3">
              <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">Equipment Name:</label>
              <input
                type="text"
                required
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none placeholder:text-slate-300"
                placeholder="NIBP Monitor"
              />
            </div>

            {/* Row 2: รพ.สต. and ID Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">รพ.สต. (Department) :</label>
                <select
                  value={departmentId}
                  onChange={(e) => {
                    const newDeptId = e.target.value;
                    setDepartmentId(newDeptId);
                    
                    if (selectedTemplateIndex !== "") {
                      const idx = parseInt(selectedTemplateIndex);
                      const template = currentTemplates[idx];
                      if (template) {
                        autoGenerateIds(newDeptId, template);
                      }
                    }
                  }}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none cursor-pointer appearance-none"
                >
                  <optgroup label="จังหวัดตัวอย่างเหนือ">
                    {HOSPITALS.filter(h => h.province === "ตัวอย่างเหนือ" || !h.province).map((hosp) => (
                      <option key={hosp.id} value={hosp.name}>
                        {hosp.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="จังหวัดตัวอย่างกลาง">
                    {HOSPITALS.filter(h => h.province === "ตัวอย่างกลาง").map((hosp) => (
                      <option key={hosp.id} value={hosp.name}>
                        {hosp.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-36 flex-shrink-0 md:pl-4">ID Code :</label>
                <input
                  type="text"
                  required
                  value={idCode}
                  onChange={(e) => setIdCode(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: Equipment No and IPM Round */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">Equipment No. :</label>
                <input
                  type="text"
                  required
                  value={equipmentNo}
                  onChange={(e) => setEquipmentNo(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-36 flex-shrink-0 md:pl-4">IPM Round :</label>
                <input
                  type="text"
                  required
                  value={ipmRound}
                  onChange={(e) => setIpmRound(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 4: IPM Date and IPM Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 relative">
                  <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">IPM Date :</label>
                  <input
                    type="text"
                    required
                    value={ipmDate}
                    onChange={(e) => setIpmDate(e.target.value)}
                    className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                    placeholder="DD/MM/YYYY"
                  />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center h-full">
                    <input
                      type="date"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) {
                          const [year, month, day] = val.split("-");
                          const yearBE = parseInt(year) + 543;
                          setIpmDate(`${day}/${month}/${yearBE}`);
                        }
                      }}
                      className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer"
                    />
                    <span className="text-slate-400 cursor-pointer pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-36 flex-shrink-0 md:pl-4">IPM Due Date :</label>
                <input
                  type="text"
                  required
                  value={ipmDueDate}
                  onChange={(e) => setIpmDueDate(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Manufacturer and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">Manufacturer :</label>
                <input
                  type="text"
                  required
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-36 flex-shrink-0 md:pl-4">Model :</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 6: SN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">SN :</label>
                <input
                  type="text"
                  required
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
              <div className="flex items-center"></div>
            </div>

            {/* Row 7: Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-b border-slate-100 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">สถานที่ปฏิบัติงาน (Location) :</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                  placeholder="Location"
                />
              </div>
              <div className="flex items-center"></div>
            </div>

            {/* Row 8: IPM Report */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-3">
              <div className="flex items-center">
                <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">IPM Report :</label>
                <input
                  type="text"
                  required
                  value={ipmReport}
                  onChange={(e) => setIpmReport(e.target.value)}
                  className="flex-1 bg-transparent border-none p-0 font-bold text-slate-800 text-xs focus:ring-0 focus:outline-none"
                />
              </div>
              <div className="flex items-center"></div>
            </div>
          </div>

          {/* IPM INFORMATION Card */}
          <div className="border border-blue-100 rounded-2xl p-6 bg-slate-50/20 space-y-4 font-sans shadow-sm">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4.5 h-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </span>
              <span className="text-xs font-black tracking-wider uppercase">IPM INFORMATION</span>
            </div>

            {/* Checkboxes Row */}
            <div className="flex items-start">
              <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0 pt-0.5">IPM Type :</label>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-3">
                {["IPM Planning", "Re-IPM", "New Equipment", "Post Repair", "IPM Miss Planning", "Other"].map((type) => {
                  const isChecked = ipmTypes.includes(type);
                  return (
                    <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleIpmTypeCheckbox(type, e.target.checked)}
                        className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500 rounded cursor-pointer transition-all"
                      />
                      <span className="text-[11px] font-semibold text-slate-700">{type}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Divider inside IPM information */}
            <div className="border-t border-slate-100/70 my-3"></div>

            {/* Environment row */}
            <div className="flex items-center">
              <label className="text-slate-500 font-semibold text-xs w-44 flex-shrink-0">IPM Environment :</label>
              <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-600">
                <div className="flex items-center">
                  <span className="text-slate-500 font-medium mr-2">Ambient Temperature:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono text-slate-800 font-bold outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-500 font-medium ml-1.5">°C</span>
                </div>

                <div className="flex items-center">
                  <span className="text-slate-500 font-medium mr-2">Humidity:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    className="w-16 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono text-slate-800 font-bold outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-500 font-medium ml-1.5">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3 pt-5 justify-end font-sans">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors border border-slate-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              id="btn-submit-registration"
              className={`px-6 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md ${
                canEdit 
                  ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                  : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
              }`}
              title={canEdit ? "" : "เฉพาะเจ้าหน้าที่ฝ่ายลงทะเบียนเท่านั้นที่ทำการบันทึกได้"}
            >
              {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
              <span>{editDevice ? "บันทึกข้อมูล (Save Changes)" : "Create Equipment Record"}</span>
              {canEdit && (
                <span className="bg-white/20 p-0.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
