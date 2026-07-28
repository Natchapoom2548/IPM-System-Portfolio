/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  ShieldCheck, 
  ShieldX, 
  Thermometer, 
  Droplets,
  Activity,
  Heart,
  UserCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Wrench,
  CheckCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Layers,
  Lock,
  Info,
  MapPin,
  Save
} from "lucide-react";
import { MedicalDevice } from "../types";
import { SignaturePad } from "./SignaturePad";
import { HOSPITALS } from "../data/mockData";

interface IPMWorkflowProps {
  devices: MedicalDevice[];
  onPassQA: (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => void;
  onFailQA: (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => void;
  onFailQAToReporting: (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => void;
  onOpenDeviceDetail: (id: string) => void;
  onSaveDraft?: (updatedDevice: MedicalDevice) => void;
  onOpenRegisterForm?: () => void;
  userRole?: string;
}

export const isAedDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("aed") || 
    nameStr.includes("aed")
  );
};

export const isDefibDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    (typeStr.includes("defib") || nameStr.includes("defib")) &&
    !isAedDevice(deviceType, name)
  );
};

export const isWeightDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr === "weight" ||
    typeStr.includes("weigh") ||
    nameStr.includes("weight") ||
    nameStr.includes("weighing")
  );
};

export const isCentrifugeDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("centrifuge") ||
    nameStr.includes("centrifuge") ||
    nameStr.includes("เหวี่ยง") ||
    nameStr.includes("ปั่น")
  );
};

export const isSyringePumpDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("syringe") ||
    nameStr.includes("syringe") ||
    nameStr.includes("ไซริงค์") ||
    nameStr.includes("กระบอกยา")
  );
};

export const isInfusionPumpDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    (typeStr.includes("infusion") ||
    nameStr.includes("infusion") ||
    typeStr.includes("pump") ||
    nameStr.includes("pump") ||
    nameStr.includes("ดริป") ||
    nameStr.includes("เครื่องให้สารละลาย")) &&
    !isSyringePumpDevice(deviceType, name)
  );
};

export const isVentilatorDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("ventilator") ||
    nameStr.includes("ventilator") ||
    nameStr.includes("เครื่องช่วยหายใจ")
  );
};

export const isOxygenDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("oxygen") ||
    typeStr.includes("concentrator") ||
    nameStr.includes("oxygen") ||
    nameStr.includes("concentrator") ||
    nameStr.includes("ออกซิเจน")
  );
};

export const isSpO2Device = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("spo2") ||
    typeStr.includes("oximeter") ||
    nameStr.includes("spo2") ||
    nameStr.includes("oximeter") ||
    nameStr.includes("ออกซิเจนในเลือด")
  );
};

export const isDoptoneDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("doptone") ||
    typeStr.includes("doppler") ||
    nameStr.includes("doptone") ||
    nameStr.includes("doppler") ||
    nameStr.includes("ฟังเสียงหัวใจทารก")
  );
};

export const isFetalMonitorDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("fetal monitor") ||
    typeStr.includes("fetal_monitor") ||
    typeStr.includes("nst") ||
    typeStr.includes("ctg") ||
    typeStr.includes("cardiotocograph") ||
    nameStr.includes("fetal monitor") ||
    nameStr.includes("fetal_monitor") ||
    nameStr.includes("nst") ||
    nameStr.includes("ctg") ||
    nameStr.includes("cardiotocograph") ||
    nameStr.includes("เฝ้าติดตามสัญญาณชีพทารก") ||
    nameStr.includes("เครื่องตรวจการหดรัดตัวของมดลูก")
  );
};

export const isPatientMonitorDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  const isBPMonitor = typeStr.includes("blood pressure") || nameStr.includes("blood pressure") || typeStr.includes("bp") || nameStr.includes("bp") || nameStr.includes("ความดัน");
  return (
    (typeStr.includes("monitor") ||
    nameStr.includes("monitor") ||
    nameStr.includes("patient") ||
    nameStr.includes("มอนิเตอร์") ||
    nameStr.includes("สัญญาณชีพ")) &&
    !isBPMonitor &&
    !isSpO2Device(deviceType, name) &&
    !isDoptoneDevice(deviceType, name) &&
    !isFetalMonitorDevice(deviceType, name)
  );
};

export const isNIBPDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    (typeStr.includes("nibp") ||
    typeStr.includes("blood pressure") ||
    typeStr.includes("bp") ||
    nameStr.includes("nibp") ||
    nameStr.includes("blood pressure") ||
    nameStr.includes("bp") ||
    nameStr.includes("ความดัน")) &&
    !isSphygmomanometerDevice(deviceType, name)
  );
};

export const isSphygmomanometerDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("sphygmomanometer") ||
    typeStr.includes("sphygmo") ||
    typeStr.includes("aneroid") ||
    typeStr.includes("mercurial") ||
    typeStr.includes("เครื่องวัดความดันแบบลูกยาง") ||
    typeStr.includes("เครื่องวัดความดันโลหิตแบบบีบมือ") ||
    nameStr.includes("sphygmomanometer") ||
    nameStr.includes("sphygmo") ||
    nameStr.includes("aneroid") ||
    nameStr.includes("mercurial") ||
    nameStr.includes("เครื่องวัดความดันแบบลูกยาง") ||
    nameStr.includes("เครื่องวัดความดันโลหิตแบบบีบมือ") ||
    nameStr.includes("บีบมือ") ||
    nameStr.includes("ลูกยางบีบ") ||
    nameStr.includes("แบบเข็ม") ||
    nameStr.includes("แบบปรอท")
  );
};

export const isEcgDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    (typeStr.includes("ecg") ||
    typeStr.includes("electrocardiograph") ||
    typeStr.includes("ekg") ||
    nameStr.includes("ecg") ||
    nameStr.includes("electrocardiograph") ||
    nameStr.includes("ekg") ||
    nameStr.includes("คลื่นไฟฟ้าหัวใจ")) &&
    !isDefibDevice(deviceType, name)
  );
};

export const isThermometerDevice = (deviceType?: string, name?: string) => {
  const typeStr = (deviceType || "").toLowerCase();
  const nameStr = (name || "").toLowerCase();
  return (
    typeStr.includes("thermometer") ||
    typeStr.includes("infrared") ||
    nameStr.includes("thermometer") ||
    nameStr.includes("infrared") ||
    nameStr.includes("วัดไข้") ||
    nameStr.includes("อุณหภูมิ")
  );
};

export const thermometerQualitativeList = [
  "Chassis/Housing",
  "Control/Switches",
  "AC Plug",
  "Battery/Charger",
  "Line Cord",
  "Indicators/Displays",
  "Strain Reliefs",
  "Time/Date Settings",
  "Circuit Breaker/Fuse",
  "Audible Signals",
  "Fittings/Connectors",
  "Labeling",
  "Record Function",
  "Accessories"
];

export const thermometerQuantitativeList = [
  { groupLabel: "Temperature Accuracy", controlSetting: "Temperature(°C)", criteria: "± 1 °C of Temp", setting: "..........", display: "", measured: "", result: "" as any }
];

export const fetalMonitorQualitativeList = [
  "Chassis/Housing", "Fan",
  "Mount", "Battery/Charger",
  "Casters/Brakes", "Indicators/Displays",
  "AC Plug", "Self-Test",
  "Line Cord", "Time/Date Settings",
  "Strain Reliefs", "Network/Wireless Interfaces / Connectivity",
  "Circuit Breaker/Fuse", "Recorder",
  "Cable", "Alarm/Interlocks",
  "Fittings/Connectors", "Audible Signals",
  "Electrodes/Transducers", "Labeling",
  "Control/Switches", "Accessories"
];

export const fetalMonitorQuantitativeList = [
  { groupLabel: "Grounding wire resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis leakage current", controlSetting: "", criteria: "≤ 500 uA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current", controlSetting: "", criteria: "≤ 100 uA", setting: "Grounded", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current", controlSetting: "", criteria: "≤ 500 uA", setting: "Ungrounded", display: "", measured: "", result: "" as any },
  { groupLabel: "Rate Calibration (ECG)", controlSetting: "", criteria: "± 5 bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Rate Calibration (ECG)", controlSetting: "", criteria: "± 5 %", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Rate Alarm (ECG)", controlSetting: "", criteria: "Below or Above", setting: "40/120", display: "", measured: "", result: "" as any },
  { groupLabel: "Intrauterine Pressure (IUP) Transducer", controlSetting: "", criteria: "± 2 mm", setting: "10 mmHg", display: "", measured: "", result: "" as any },
  { groupLabel: "Intrauterine Pressure (IUP) Transducer", controlSetting: "", criteria: "± 2 mm", setting: "30 mmHg", display: "", measured: "", result: "" as any },
  { groupLabel: "Paper speed (mm/sec)", controlSetting: "", criteria: "± 2 %", setting: "25 mm/sec", display: "", measured: "", result: "" as any }
];

export const sphygmomanometerQualitativeList = [
  "Chassis/Housing",
  "Bleed Valve",
  "Mount/Fasteners",
  "Indicators/Displays",
  "Casters/Brakes",
  "Zero Pressure Setting",
  "Tubes/Hoses/Bulbs",
  "Labeling",
  "Fittings/Connectors",
  "Cuff",
  "Filters",
  "Gauge/Column"
];

export const sphygmomanometerQuantitativeList = [
  { groupLabel: "Air Leakage (< 15 mmHg/min)", controlSetting: "", criteria: "< 15 mmHg/min", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Pressure Accuracy (±3 mmHg)", controlSetting: "200", criteria: "±3 mmHg", setting: "200", display: "", measured: "", result: "" as any },
  { groupLabel: "Pressure Accuracy (±3 mmHg)", controlSetting: "120", criteria: "±3 mmHg", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Pressure Accuracy (±3 mmHg)", controlSetting: "60", criteria: "±3 mmHg", setting: "60", display: "", measured: "", result: "" as any }
];

export const calculateAverage = (m1: string, m2: string, m3: string): string => {
  const vals = [parseFloat(m1), parseFloat(m2), parseFloat(m3)].filter(v => !isNaN(v));
  if (vals.length === 0) return "";
  const avgVal = vals.reduce((sum, v) => sum + v, 0) / vals.length;
  return avgVal.toFixed(2);
};

export const ecgQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "Casters/Brakes",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Circuit Breaker/Fuse",
  "Cables",
  "Fittings/Connectors",
  "Electrode",
  "Controls/Switches",
  "Battery/Charger",
  "Indicators/Displays",
  "Lead Off Detection",
  "Time/Date Settings",
  "Connectivity",
  "Data Transfer to Data Management System",
  "Print Quality",
  "Paper Transport",
  "Labeling",
  "Accessories"
];

export const ecgQuantitativeList = [
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Patient Leakage Current - Grounded", controlSetting: "", criteria: "≤ 100 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Patient Leakage Current - Ungrounded", controlSetting: "", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "60", criteria: "± 5 bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "120", criteria: "± 5 %", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Amplitude Accuracy (mm/mV)", controlSetting: "", criteria: "± 5 %", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Paper speed (mm/sec)", controlSetting: "25 mm/sec", criteria: "± 2 %", setting: "25 mm/sec", display: "", measured: "", result: "" as any },
  { groupLabel: "Paper speed (mm/sec)", controlSetting: "50 mm/sec", criteria: "± 2 %", setting: "50 mm/sec", display: "", measured: "", result: "" as any }
];

export const defibQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "Casters/Brakes",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Receptacles",
  "Circuit Breaker/Fuse",
  "Cables",
  "Fittings/Connectors",
  "Paddles/Electrode",
  "Control/Switches",
  "Recorder (ECG)",
  "Battery/Charger",
  "Indicators/Displays",
  "Self-Test",
  "Time / Date Setting",
  "connectivity",
  "Synchronized Cardioverter",
  "Integral Output Tester",
  "Alarm",
  "Pacemaker Demand-Mode Activation/Inhibition",
  "Audible Signals",
  "Labeling",
  "Accessories",
  "Other.................."
];

export const aedQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "Strain Reliefs",
  "Receptacles",
  "Circuit Breaker/Fuse",
  "Cables",
  "Fittings/Connectors",
  "Paddles/Electrode",
  "Control/Switches",
  "Battery/Charger",
  "Indicators/Displays",
  "Self-Test",
  "Time / Date Setting",
  "connectivity",
  "Alarm",
  "Audible Signals",
  "Labeling",
  "Accessories",
  "Other............."
];

export const weightQualitativeList = [
  "Chassis/Housing/Frame",
  "Control/Switches",
  "Mount/Fastener",
  "Battery/Charger",
  "Casters/Brakes",
  "Indicators/Displays",
  "AC Plug",
  "Labeling",
  "Line Cord",
  "Accessories",
  "Strain Reliefs"
];

export const centrifugeQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Circuit Breaker/Fuse",
  "Control/Switches",
  "Motor/Rotor/Pump",
  "Brake",
  "Indicators/Displays",
  "Alarms/Interlocks",
  "Audible Signals",
  "Labeling",
  "Accessories"
];

export const syringeQualitativeList = [
  "Chassis/Housing",
  "Time / Date Setting",
  "Mount/Fastener",
  "Miss loaded Syringe",
  "AC Plug/Receptacles",
  "Empty Syringe",
  "Line Cord",
  "Network/Wireless Interface",
  "Strain Reliefs",
  "Audible Signals",
  "Fittings/Connectors",
  "Free-Flow Prevention Mechanism / Stop",
  "Control/Switches",
  "Nurse Call (verify only if this function is used)",
  "Indicators / Displays",
  "Labeling",
  "Other..............",
  "Handbook"
];

export const infusionQualitativeList = [
  "Chassis/Housing",
  "Open Door/Misloaded Infusion Set,Syringe",
  "Mount/Fastener",
  "Empty Syringe",
  "AC Plug/Receptacles",
  "Occlusion Device",
  "Line Cord",
  "Drop Sensor",
  "Strain Reliefs",
  "Infusion Complete",
  "Fittings/Connectors",
  "Free-Flow Prevention Mechanism / Stop",
  "Control/Switches",
  "Nurse Call (verify only if this function is used)",
  "Indicators / Displays",
  "Labeling",
  "Time / Date Setting",
  "Accessories",
  "Connectivity",
  "Handbook",
  "Alarm Function"
];

export const ventilatorQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "Casters/Breaks",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Circuit Breaker/Fuse",
  "Tubes/Hoses",
  "Cables",
  "Fittings/Connectors",
  "Filters",
  "Network/Wireless/interfaces",
  "Time / Date Setting",
  "Control/Switches",
  "Pressure-Relief Mechanism",
  "Fan",
  "Battery/Charger",
  "Indicators/Displays",
  "Operational Modes",
  "Labeling",
  "Accessories",
  "Air Compressor / Turbine",
  "Gas Cylinders, Gauges And Regulators (for transport ventilators)",
  "Humidifiers Device",
  "Heater Expire Filter",
  "Handbook"
];

export const patientMonitorQualitativeList = [
  "Chassis/Housing",
  "Mount/Fasteners",
  "Casters/Brakes",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Tubes/Hoses",
  "Fittings/Connectors",
  "Cuff",
  "Cable",
  "Control/Switches",
  "Battery/Charger",
  "Indicators/Displays",
  "Recorder/Printer",
  "Time/Date Settings",
  "Network/Wireless Interfaces / Connectivity",
  "User Calibration/Self-Test",
  "Alarm",
  "Audible Signals",
  "Fan",
  "Labeling",
  "Accessories"
];

export const generalQualitativeList = [
  "Chassis/Housing",
  "Battery/Charger",
  "AC Plug",
  "Line Cord",
  "Indicators/Displays",
  "Self-Test",
  "Cables",
  "Alarm",
  "Control/Switches",
  "Labeling",
  "Accessories"
];

export const oxygenQualitativeList = [
  "Chassis/Housing",
  "On-off Switch",
  "Mount/Fasteners",
  "Nebulizer Outlet",
  "AC Plug",
  "Compressor",
  "Line Cord",
  "Brake",
  "Strain Reliefs",
  "Indicators/Displays",
  "Circuit Breaker/Fuse",
  "Alarms/Interlocks",
  "Fan Filter",
  "Audible Signals",
  "Knob Flow meter",
  "Labeling"
];

export const oxygenQuantitativeList = [
  { groupLabel: "Oxygen Concentration(l/min)", controlSetting: "Oxygen Concentration(l/min)", criteria: "≥93 %", setting: "3L/min", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Accuracy of Flow Setting", controlSetting: "Accuracy of Flow Setting", criteria: "±0.5 L/min", setting: "2L/min", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Accuracy of Flow Setting", controlSetting: "Accuracy of Flow Setting", criteria: "±0.5 L/min", setting: "5L/min", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Accuracy of Flow Setting", controlSetting: "Accuracy of Flow Setting", criteria: "±0.5 L/min", setting: "............L/min (Maximum)", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Accuracy of Flow Setting", controlSetting: "Accuracy of Flow Setting", criteria: "±0.5 L/min", setting: "10L/min", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Accuracy of Flow Setting", controlSetting: "Accuracy of Flow Setting", criteria: "±0.5 L/min", setting: "15L/min", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Outlet Pressure", controlSetting: "Outlet Pressure", criteria: "mfr spec or5-7 psig", setting: "...................... (Maximum)", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Cycle Time", controlSetting: "Cycle Time", criteria: "mfr spec", setting: "", display: "", measured: "", result: "" as any, m1: "", m2: "", m3: "", avg: "" },
  { groupLabel: "Ground Wire Resistance", controlSetting: "Ground Wire Resistance", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "Chassis Leakage Current", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
];

export const defibQuantitativeList = [
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current - Grounded", controlSetting: "", criteria: "< 100 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current - Ungrounded (Open earth)", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "60", criteria: "± 5 bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "120", criteria: "± 5%", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Recorder speed (mm/sec)", controlSetting: "25", criteria: "± 4%", setting: "25", display: "", measured: "", result: "" as any },
  { groupLabel: "Output accuracy (Jules)", controlSetting: "100", criteria: "± 15%", setting: "100", display: "", measured: "", result: "" as any },
  { groupLabel: "Output accuracy (Jules)", controlSetting: "150", criteria: "± 15%", setting: "150", display: "", measured: "", result: "" as any },
  { groupLabel: "Output accuracy (Jules)", controlSetting: "200", criteria: "± 15%", setting: "200", display: "", measured: "", result: "" as any },
  { groupLabel: "Output energy at maximum setting for 10 charge cycles (Jules)", controlSetting: "200 J", criteria: "± 15 %", setting: "200 J", display: "", measured: "", result: "" as any },
  { groupLabel: "Charge time after 10 discharge cycles (sec)", controlSetting: "", criteria: "≤ 15 sec", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Energy after 60 sec of full charge (Jules) (30 sec for Philips Product)", controlSetting: "200 J", criteria: "≥ 85 % of Energy Setting", setting: "200 J", display: "", measured: "", result: "" as any },
  { groupLabel: "AED Mode Analysis and Defibrillator Output", controlSetting: "", criteria: "≥ 85 % of Energy Setting", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Pacer output accuracy (Demand Mode) (mA)", controlSetting: "100", criteria: "± 10 %", setting: "100", display: "", measured: "", result: "" as any },
  { groupLabel: "Pacer rate accuracy (Fix Mode) (ppm)", controlSetting: "120", criteria: "± 5 %", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Pediatric Mode Output Energy (Jules)", controlSetting: "", criteria: "≤ 50 J", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Internal Paddle Energy Limit (Jules)", controlSetting: "", criteria: "≤ 50 J", setting: "", display: "", measured: "", result: "" as any },
];

export const aedQuantitativeList = [
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "60", criteria: "± 5 bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart Rate Accuracy (bpm)", controlSetting: "120", criteria: "± 5%", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "AED Mode Analysis and Defibrillator Output", controlSetting: "ครั้งที่ 1", criteria: "per mfr / hos policy", setting: "ครั้งที่ 1", display: "", measured: "", result: "" as any },
  { groupLabel: "AED Mode Analysis and Defibrillator Output", controlSetting: "ครั้งที่ 2", criteria: "per mfr / hos policy", setting: "ครั้งที่ 2", display: "", measured: "", result: "" as any },
  { groupLabel: "AED Mode Analysis and Defibrillator Output", controlSetting: "ครั้งที่ 3", criteria: "per mfr / hos policy", setting: "ครั้งที่ 3", display: "", measured: "", result: "" as any },
  { groupLabel: "Pediatric Mode Output Energy (Jules)", controlSetting: "", criteria: "≤ 50 J", setting: "", display: "", measured: "", result: "" as any }
];

export const weightQuantitativeList = [
  { groupLabel: "Ground Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Zero Calibration", controlSetting: "", criteria: "", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Adult", controlSetting: "", criteria: "± 1%", setting: "20", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Adult", controlSetting: "", criteria: "± 1%", setting: "40", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Adult", controlSetting: "", criteria: "± 1%", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Adult", controlSetting: "", criteria: "± 1%", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Adult", controlSetting: "", criteria: "± 1%", setting: "100", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Infant", controlSetting: "", criteria: "± 1%", setting: "1", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Infant", controlSetting: "", criteria: "± 1%", setting: "5", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Infant", controlSetting: "", criteria: "± 1%", setting: "10", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Infant", controlSetting: "", criteria: "± 1%", setting: "15", display: "", measured: "", result: "" as any },
  { groupLabel: "Weight Accuracy for Infant", controlSetting: "", criteria: "± 1%", setting: "20", display: "", measured: "", result: "" as any },
];

export const centrifugeQuantitativeList = [
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "≤ 3500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Temperature Accuracy", controlSetting: "", criteria: "± 3 °C", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Timer Accuracy", controlSetting: "", criteria: "± 10%", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Accuracy of Speed Setting", controlSetting: "4,000", criteria: "± 10%", setting: "4,000", display: "", measured: "", result: "" as any },
  { groupLabel: "Accuracy of Speed Setting", controlSetting: "10,000", criteria: "± 10%", setting: "10,000", display: "", measured: "", result: "" as any },
  { groupLabel: "Accuracy of Speed Setting", controlSetting: "12,000", criteria: "± 10%", setting: "12,000", display: "", measured: "", result: "" as any },
];

export const syringeQuantitativeList = [
  { groupLabel: "Ground Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Verify unit operates on battery", controlSetting: "", criteria: "> 30 min.", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Alarm Function", controlSetting: "", criteria: "", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "", criteria: "± 5%", setting: "10", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "", criteria: "± 5%", setting: "100", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "", criteria: "± 5%", setting: "150", display: "", measured: "", result: "" as any },
  { groupLabel: "Occlusion Pressure (mmHg) < 850 mmHg", controlSetting: "", criteria: "± 50 mmHg of Setting", setting: "< 850 mmHg", display: "", measured: "", result: "" as any },
];

export const infusionQuantitativeList = [
  { groupLabel: "Ground Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Verify unit operates on battery", controlSetting: "", criteria: "> 30 min.", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Air in Line Alarm Function(100 µL)", controlSetting: "", criteria: "", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "Flow Rate (ml/hr)", criteria: "± 10%", setting: "10", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "Flow Rate (ml/hr)", criteria: "± 10%", setting: "100", display: "", measured: "", result: "" as any },
  { groupLabel: "Flow Rate (ml/hr)", controlSetting: "Flow Rate (ml/hr)", criteria: "± 10%", setting: "300", display: "", measured: "", result: "" as any },
  { groupLabel: "Occlusion Pressure (mmHg)< 850 mmHg", controlSetting: "Occlusion Pressure (mmHg)< 850 mmHg", criteria: "± 50 mmHg of Setting", setting: "< 850 mmHg", display: "", measured: "", result: "" as any }
];

export const ventilatorQuantitativeList = [
  // Electrical Safety Test
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
  // Measured Value >> Volume Control Mode (Set : RR = 20 bpm)
  { groupLabel: "Tidal Volume (ml) (VC Mode)", controlSetting: "400", criteria: "±10% of setting", setting: "400", display: "", measured: "", result: "" as any },
  { groupLabel: "Tidal Volume (ml) (VC Mode)", controlSetting: "500", criteria: "±10% of setting", setting: "500", display: "", measured: "", result: "" as any },
  { groupLabel: "Tidal Volume (ml) (VC Mode)", controlSetting: "600", criteria: "±10% of setting", setting: "600", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Flow Rate (lpm) (VC Mode)", controlSetting: "40", criteria: "±10% of setting", setting: "40", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Flow Rate (lpm) (VC Mode)", controlSetting: "50", criteria: "±10% of setting", setting: "50", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Flow Rate (lpm) (VC Mode)", controlSetting: "60", criteria: "±10% of setting", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "PEEP (cmH2O) (VC Mode)", controlSetting: "3", criteria: "±10% of setting or mfr Spec < ..........", setting: "3", display: "", measured: "", result: "" as any },
  { groupLabel: "PEEP (cmH2O) (VC Mode)", controlSetting: "5", criteria: "±10% of setting or mfr Spec < ..........", setting: "5", display: "", measured: "", result: "" as any },
  { groupLabel: "PEEP (cmH2O) (VC Mode)", controlSetting: "10", criteria: "±10% of setting or mfr Spec < ..........", setting: "10", display: "", measured: "", result: "" as any },
  // Measured Value >> Pressure Control Mode
  { groupLabel: "Peak Inspire Pressure (cmH2O) (PC Mode)", controlSetting: "10", criteria: "±10% of setting", setting: "10", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Pressure (cmH2O) (PC Mode)", controlSetting: "20", criteria: "±10% of setting", setting: "20", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Pressure (cmH2O) (PC Mode)", controlSetting: "30", criteria: "±10% of setting", setting: "30", display: "", measured: "", result: "" as any },
  { groupLabel: "Peak Inspire Pressure (cmH2O) (PC Mode)", controlSetting: "40", criteria: "±10% of setting", setting: "40", display: "", measured: "", result: "" as any },
  { groupLabel: "Respiratory Rate (bpm) (PC Mode)", controlSetting: "12", criteria: "± 2 bpm", setting: "12", display: "", measured: "", result: "" as any },
  { groupLabel: "Respiratory Rate (bpm) (PC Mode)", controlSetting: "16", criteria: "± 2 bpm", setting: "16", display: "", measured: "", result: "" as any },
  { groupLabel: "Respiratory Rate (bpm) (PC Mode)", controlSetting: "20", criteria: "± 2 bpm", setting: "20", display: "", measured: "", result: "" as any },
  { groupLabel: "Inspire time (sec) (PC Mode)", controlSetting: "1.00", criteria: "±10% of setting", setting: "1.00", display: "", measured: "", result: "" as any },
  { groupLabel: "Inspire time (sec) (PC Mode)", controlSetting: "1.50", criteria: "±10% of setting", setting: "1.50", display: "", measured: "", result: "" as any },
  { groupLabel: "FiO2 Accuracy (%) (PC Mode)", controlSetting: "40%", criteria: "±10% of setting", setting: "40%", display: "", measured: "", result: "" as any },
  { groupLabel: "FiO2 Accuracy (%) (PC Mode)", controlSetting: "60%", criteria: "±10% of setting", setting: "60%", display: "", measured: "", result: "" as any },
  { groupLabel: "FiO2 Accuracy (%) (PC Mode)", controlSetting: "100%", criteria: "±10% of setting", setting: "100%", display: "", measured: "", result: "" as any },
  // Measured Value >> Alarm Function
  { groupLabel: "High Rate (bpm) (Alarm)", controlSetting: "40", criteria: "±2 bpm", setting: "40", display: "", measured: "", result: "" as any },
  { groupLabel: "High Minute Volume (L) (Alarm)", controlSetting: "8", criteria: "± 10%", setting: "8", display: "", measured: "", result: "" as any },
  { groupLabel: "Low Minute Volume (L) (Alarm)", controlSetting: "2", criteria: "± 10%", setting: "2", display: "", measured: "", result: "" as any },
  { groupLabel: "High Peak Inspire Pressure (cmH2O) (Alarm)", controlSetting: "40", criteria: "± 10%", setting: "40", display: "", measured: "", result: "" as any },
  { groupLabel: "High Peak Inspire Pressure (cmH2O) (Alarm)", controlSetting: "50", criteria: "± 10%", setting: "50", display: "", measured: "", result: "" as any },
  { groupLabel: "Apnea Time Interval (sec) (Alarm)", controlSetting: "20", criteria: "± 2 sec", setting: "20", display: "", measured: "", result: "" as any },
];

export const patientMonitorQuantitativeList = [
  // Electrical Safety Test
  { groupLabel: "Ground wire resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis leakage current", controlSetting: "", criteria: "≤ 500 uA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current :", controlSetting: "Grounded", criteria: "≤ 100 uA", setting: "Grounded", display: "", measured: "", result: "" as any },
  { groupLabel: "Lead to Ground Leakage Current :", controlSetting: "Ungrounded", criteria: "≤ 500 uA", setting: "Ungrounded", display: "", measured: "", result: "" as any },
  // Rate Calibration (ECG)
  { groupLabel: "Rate Calibration (ECG)", controlSetting: "60", criteria: "± 5 bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Rate Calibration (ECG)", controlSetting: "120", criteria: "± 5 %", setting: "120", display: "", measured: "", result: "" as any },
  // Rate Alarm (ECG)
  { groupLabel: "Rate Alarm (ECG)", controlSetting: "40/120", criteria: "Below or above", setting: "40/120", display: "", measured: "", result: "" as any },
  // Paper speed (mm/sec)
  { groupLabel: "Paper speed (mm/sec)", controlSetting: "25 mm/sec", criteria: "± 2 %", setting: "25 mm/sec", display: "", measured: "", result: "" as any },
  // Air leakage test (mmHg/min)
  { groupLabel: "Air leakage test (mmHg/min)", controlSetting: "300 mmHg", criteria: "≤ 15 mmHg/min.", setting: "300 mmHg", display: "", measured: "", result: "" as any },
  // Static pressure (mmHg)
  { groupLabel: "Static pressure (mmHg)", controlSetting: "80", criteria: "±3 mmHg", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "Static pressure (mmHg)", controlSetting: "120", criteria: "±3 mmHg", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Static pressure (mmHg)", controlSetting: "200", criteria: "±3 mmHg", setting: "200", display: "", measured: "", result: "" as any },
  // Pressure relief test (mmHg)
  { groupLabel: "Pressure relief test (mmHg)", controlSetting: "", criteria: "≤ 330 mmHg or [ ] mfr Spec < .......... mmHg", setting: "", display: "", measured: "", result: "" as any },
  // Stop / Cancel / Deflate (sec)
  { groupLabel: "Stop / Cancel / Deflate (sec)", controlSetting: "", criteria: "≤ 10 sec", setting: "", display: "", measured: "", result: "" as any },
  // Dynamic pressure (mmHg) (Systolic & Diastolic)
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "80/50", criteria: "± 10 mmHg", setting: "80/50", display: "", measured: "", result: "" as any },
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "120/80", criteria: "± 10 mmHg", setting: "120/80", display: "", measured: "", result: "" as any },
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "200/150", criteria: "± 10 mmHg", setting: "200/150", display: "", measured: "", result: "" as any },
  // Respiration Rate (bpm)
  { groupLabel: "Respiration Rate (bpm)", controlSetting: "15 (Adult)", criteria: "± 5 %", setting: "15 (Adult)", display: "", measured: "", result: "" as any },
  { groupLabel: "Respiration Rate (bpm)", controlSetting: "30 (Infant)", criteria: "± 5 %", setting: "30 (Infant)", display: "", measured: "", result: "" as any },
  { groupLabel: "Respiration Rate (bpm)", controlSetting: "100 (High Rate)", criteria: "± 5 %", setting: "100 (High Rate)", display: "", measured: "", result: "" as any },
  // SpO2 (% of SpO2)
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "90", criteria: "± 3 digit of SpO2", setting: "90", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "96", criteria: "± 3 digit of SpO2", setting: "96", display: "", measured: "", result: "" as any },
];

export const nibpQualitativeList = [
  "Chassis/Housing",
  "Cuff",
  "Mount/Fasteners",
  "Control/Switches",
  "Casters/Brakes",
  "Battery/Charger",
  "AC Plug",
  "Indicators/Displays",
  "Line Cord",
  "Time/Date Settings",
  "Strain Reliefs",
  "Network/Wireless Interfaces",
  "Circuit Breaker/Fuse",
  "Audible Signals",
  "Tubes/Hoses",
  "Labeling",
  "Fittings/Connectors",
  "Accessories/SPO2 Sensor",
  "Record Function",
  "Alarm Function"
];

export const spo2QualitativeList = [
  "Chassis/Housing",
  "AC Plug",
  "Line Cord",
  "Strain Reliefs",
  "Circuit Breaker/Fuse",
  "Fittings/Connectors",
  "Record Function",
  "Control/Switches",
  "Battery/Charger",
  "Indicators/Displays",
  "Time/Date Settings",
  "Network/Wireless Interfaces",
  "Audible Signals",
  "Labeling",
  "Accessories/SPO2 Sensor",
  "Alarm Function"
];

export const spo2QuantitativeList = [
  // Electrical Safety Test
  { groupLabel: "Grounding wire resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis leakage current", controlSetting: "", criteria: "≤ 500 uA", setting: "", display: "", measured: "", result: "" as any },
  // SpO2 (% of SpO2)
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "80", criteria: "3% digit of SpO2", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "90", criteria: "3% digit of SpO2", setting: "90", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "95", criteria: "3% digit of SpO2", setting: "95", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "98", criteria: "3% digit of SpO2", setting: "98", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "100", criteria: "3% digit of SpO2", setting: "100", display: "", measured: "", result: "" as any },
  // Heart rate (bpm) SpO2
  { groupLabel: "Heart rate (bpm) SpO2", controlSetting: "60", criteria: "5% bpm", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart rate (bpm) SpO2", controlSetting: "80", criteria: "5% bpm", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart rate (bpm) SpO2", controlSetting: "90", criteria: "5% bpm", setting: "90", display: "", measured: "", result: "" as any },
  { groupLabel: "Heart rate (bpm) SpO2", controlSetting: "100", criteria: "5% bpm", setting: "100", display: "", measured: "", result: "" as any }
];

export const doptoneQualitativeList = [
  "Chassis/Housing",
  "AC Plug / Charger",
  "Line Cord",
  "Strain Reliefs",
  "Transducer/Probe",
  "Control/Switches",
  "Battery/Charger",
  "Indicators/Displays",
  "Volume Control",
  "Audible Signals",
  "Labeling",
  "Accessories"
];

export const doptoneQuantitativeList = [
  // Electrical Safety Test
  { groupLabel: "Grounding wire resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis leakage current", controlSetting: "", criteria: "≤ 500 uA", setting: "", display: "", measured: "", result: "" as any },
  // Ultrasound Frequency Verification
  { groupLabel: "Ultrasound frequency (MHz)", controlSetting: "2.0 MHz", criteria: "± 10%", setting: "2.0", display: "", measured: "", result: "" as any },
  // Fetal Heart Rate Simulation (bpm)
  { groupLabel: "Fetal Heart Rate (bpm)", controlSetting: "120 bpm", criteria: "± 5 bpm", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Fetal Heart Rate (bpm)", controlSetting: "160 bpm", criteria: "± 5 bpm", setting: "160", display: "", measured: "", result: "" as any }
];

export const nibpQuantitativeList = [
  // Electrical Safety Test
  { groupLabel: "Grounding wire resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis leakage current", controlSetting: "", criteria: "≤ 500 uA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Self-Test or Specific Performance Testing\n(Service Mode)", controlSetting: "", criteria: "", setting: "", display: "", measured: "", result: "" as any },
  // Air leakage test
  { groupLabel: "Air leakage test (mmHg/min)", controlSetting: "Air leakage test (mmHg/min)", criteria: "< 10 mmHg/min.", setting: "300 mmHg", display: "", measured: "", result: "" as any },
  // Pressure relief test
  { groupLabel: "Pressure relief test (mmHg)", controlSetting: "Pressure relief test (mmHg)", criteria: "< 330 mmHg or\n[ ] mfr Spec\n< ............ mmHg", setting: "", display: "", measured: "", result: "" as any },
  // Stop / Cancel / Deflate
  { groupLabel: "Stop / Cancel / Deflate (sec)", controlSetting: "Stop / Cancel / Deflate (sec)", criteria: "≤ 10 sec", setting: "", display: "", measured: "", result: "" as any },
  // Static pressure
  { groupLabel: "Static pressure(mmHg)", controlSetting: "Static pressure(mmHg)", criteria: "±3 mmHg", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "Static pressure(mmHg)", controlSetting: "Static pressure(mmHg)", criteria: "±3 mmHg", setting: "120", display: "", measured: "", result: "" as any },
  { groupLabel: "Static pressure(mmHg)", controlSetting: "Static pressure(mmHg)", criteria: "±3 mmHg", setting: "200", display: "", measured: "", result: "" as any },
  // Dynamic pressure
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", criteria: "± 10 mmHg", setting: "80/50", display: "", measured: "", result: "" as any },
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", criteria: "± 10 mmHg", setting: "120/80", display: "", measured: "", result: "" as any },
  { groupLabel: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", controlSetting: "Dynamic pressure (mmHg)\n(Systolic & Diastolic)", criteria: "± 10 mmHg", setting: "200/150", display: "", measured: "", result: "" as any },
  // SpO2
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "SpO2 (% of SpO2)", criteria: "± 3 digit of SpO2", setting: "80", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "SpO2 (% of SpO2)", criteria: "± 3 digit of SpO2", setting: "90", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "SpO2 (% of SpO2)", criteria: "± 3 digit of SpO2", setting: "95", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "SpO2 (% of SpO2)", criteria: "± 3 digit of SpO2", setting: "98", display: "", measured: "", result: "" as any },
  { groupLabel: "SpO2 (% of SpO2)", controlSetting: "SpO2 (% of SpO2)", criteria: "± 3 digit of SpO2", setting: "100", display: "", measured: "", result: "" as any },
  // Heart rate
  { groupLabel: "Heart rate (bpm) SpO2", controlSetting: "Heart rate (bpm) SpO2", criteria: "5% bpm", setting: "80", display: "", measured: "", result: "" as any }
];

export const generalQuantitativeList = [
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Enclosure Leakage Current", controlSetting: "", criteria: "< 100 µA", setting: "", display: "", measured: "", result: "" as any },
];

export type DeviceChecklistCategory =
  | "AED"
  | "Defibrillator"
  | "ECG"
  | "Weight"
  | "Centrifuge"
  | "Syringe Pump"
  | "Infusion Pump"
  | "Ventilator"
  | "Patient Monitor"
  | "SpO2"
  | "Doptone"
  | "NIBP"
  | "Oxygen Concentrator"
  | "Thermometer"
  | "Sphygmomanometer"
  | "Fetal Monitor"
  | "General Medical Device";

type QualitativeTask = NonNullable<MedicalDevice["qualitativeTasks"]>[number];
type QuantitativeTask = NonNullable<MedicalDevice["quantitativeTasks"]>[number];
type PmTask = NonNullable<MedicalDevice["pmTasks"]>[number];

export const DEFAULT_CHECKLISTS: Record<DeviceChecklistCategory, readonly string[]> = {
  AED: aedQualitativeList,
  Defibrillator: defibQualitativeList,
  ECG: ecgQualitativeList,
  Weight: weightQualitativeList,
  Centrifuge: centrifugeQualitativeList,
  "Syringe Pump": syringeQualitativeList,
  "Infusion Pump": infusionQualitativeList,
  Ventilator: ventilatorQualitativeList,
  "Patient Monitor": patientMonitorQualitativeList,
  SpO2: spo2QualitativeList,
  Doptone: doptoneQualitativeList,
  NIBP: nibpQualitativeList,
  "Oxygen Concentrator": oxygenQualitativeList,
  Thermometer: thermometerQualitativeList,
  Sphygmomanometer: sphygmomanometerQualitativeList,
  "Fetal Monitor": fetalMonitorQualitativeList,
  "General Medical Device": generalQualitativeList
};

export const DEFAULT_QUANTITATIVE: Record<DeviceChecklistCategory, readonly QuantitativeTask[]> = {
  AED: aedQuantitativeList,
  Defibrillator: defibQuantitativeList,
  ECG: ecgQuantitativeList,
  Weight: weightQuantitativeList,
  Centrifuge: centrifugeQuantitativeList,
  "Syringe Pump": syringeQuantitativeList,
  "Infusion Pump": infusionQuantitativeList,
  Ventilator: ventilatorQuantitativeList,
  "Patient Monitor": patientMonitorQuantitativeList,
  SpO2: spo2QuantitativeList,
  Doptone: doptoneQuantitativeList,
  NIBP: nibpQuantitativeList,
  "Oxygen Concentrator": oxygenQuantitativeList,
  Thermometer: thermometerQuantitativeList,
  Sphygmomanometer: sphygmomanometerQuantitativeList,
  "Fetal Monitor": fetalMonitorQuantitativeList,
  "General Medical Device": generalQuantitativeList
};

const GENERAL_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดภายนอกและภายในเครื่อง)", done: false, comment: "" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วนเคลื่อนไหว)", done: false, comment: "" },
  { taskName: "Filter / Screens Check (ตรวจสอบ/เปลี่ยนแผ่นกรองอากาศ)", done: false, comment: "" },
  { taskName: "Battery / Backup System Check (ตรวจสอบสภาพแบตเตอรี่สำรอง)", done: false, comment: "" },
  { taskName: "Electrical Safety Check (ตรวจสอบความปลอดภัยทางไฟฟ้าชีวการแพทย์)", done: false, comment: "" },
  { taskName: "Other / Calibrate (ปรับแต่งเทียบค่ามาตรฐานและส่วนอื่นๆ)", done: false, comment: "" }
];

const STANDARD_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดเครื่อง)", done: false, comment: "" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: false, comment: "" },
  { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: false, comment: "" },
  { taskName: "Battery (Replace every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: false, comment: "" },
  { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: false, comment: "" }
];

const DEFIB_ECG_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดเครื่อง)", done: false, comment: "" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: false, comment: "" },
  { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: false, comment: "" },
  { taskName: "Battery (Replace Every 18 month) (เปลี่ยนแบตเตอรี่ ทุก 18 เดือน)", done: false, comment: "" }
];

const AED_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดเครื่อง)", done: false, comment: "" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: false, comment: "" },
  { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: false, comment: "" },
  { taskName: "Battery ( Replace Every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: false, comment: "" }
];

const SPHYGMOMANOMETER_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดเครื่อง)", done: false, comment: "" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: false, comment: "" },
  { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: false, comment: "" },
  { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: false, comment: "" }
];

const OXYGEN_PM_TASKS: readonly PmTask[] = [
  { taskName: "Clean (ทำความสะอาดภายนอกและภายในเครื่อง)", done: false, comment: "" },
  { taskName: "Fan Filter (Inlet) (ตรวจสอบแผ่นกรองอากาศทางเข้า)", done: false, comment: "" },
  { taskName: "Hoes/Silicon (ตรวจสอบท่อสายยาง/ซิลิโคน)", done: false, comment: "" },
  { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: false, comment: "" },
  { taskName: "Zeolite (ตรวจสอบสารซีโอไลต์กรองออกซิเจน)", done: false, comment: "" },
  { taskName: "Battery ( Replace Every 18-24month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: false, comment: "" },
  { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: false, comment: "" }
];

export const DEFAULT_PM_TASKS: Record<DeviceChecklistCategory, readonly PmTask[]> = {
  AED: AED_PM_TASKS,
  Defibrillator: DEFIB_ECG_PM_TASKS,
  ECG: DEFIB_ECG_PM_TASKS,
  Weight: STANDARD_PM_TASKS,
  Centrifuge: STANDARD_PM_TASKS,
  "Syringe Pump": STANDARD_PM_TASKS,
  "Infusion Pump": STANDARD_PM_TASKS,
  Ventilator: GENERAL_PM_TASKS,
  "Patient Monitor": STANDARD_PM_TASKS,
  SpO2: STANDARD_PM_TASKS,
  Doptone: GENERAL_PM_TASKS,
  NIBP: STANDARD_PM_TASKS,
  "Oxygen Concentrator": OXYGEN_PM_TASKS,
  Thermometer: STANDARD_PM_TASKS,
  Sphygmomanometer: SPHYGMOMANOMETER_PM_TASKS,
  "Fetal Monitor": STANDARD_PM_TASKS,
  "General Medical Device": GENERAL_PM_TASKS
};

export function getChecklistCategory(deviceType?: string, name?: string): DeviceChecklistCategory {
  if (isAedDevice(deviceType, name)) return "AED";
  if (isDefibDevice(deviceType, name)) return "Defibrillator";
  if (isEcgDevice(deviceType, name)) return "ECG";
  if (isWeightDevice(deviceType, name)) return "Weight";
  if (isCentrifugeDevice(deviceType, name)) return "Centrifuge";
  if (isSyringePumpDevice(deviceType, name)) return "Syringe Pump";
  if (isInfusionPumpDevice(deviceType, name)) return "Infusion Pump";
  if (isVentilatorDevice(deviceType, name)) return "Ventilator";
  if (isSpO2Device(deviceType, name)) return "SpO2";
  if (isDoptoneDevice(deviceType, name)) return "Doptone";
  if (isNIBPDevice(deviceType, name)) return "NIBP";
  if (isOxygenDevice(deviceType, name)) return "Oxygen Concentrator";
  if (isThermometerDevice(deviceType, name)) return "Thermometer";
  if (isSphygmomanometerDevice(deviceType, name)) return "Sphygmomanometer";
  if (isFetalMonitorDevice(deviceType, name)) return "Fetal Monitor";
  if (isPatientMonitorDevice(deviceType, name)) return "Patient Monitor";
  return "General Medical Device";
}

export function createDefaultChecklistsForDevice(deviceType?: string, name?: string): {
  qualitativeTasks: QualitativeTask[];
  quantitativeTasks: QuantitativeTask[];
  pmTasks: PmTask[];
} {
  const category = getChecklistCategory(deviceType, name);
  const qualitativeSource = DEFAULT_CHECKLISTS[category] || DEFAULT_CHECKLISTS["General Medical Device"];
  const quantitativeSource = DEFAULT_QUANTITATIVE[category] || DEFAULT_QUANTITATIVE["General Medical Device"];
  const pmSource = DEFAULT_PM_TASKS[category] || DEFAULT_PM_TASKS["General Medical Device"];

  return {
    qualitativeTasks: qualitativeSource.map((taskName) => ({
      taskName,
      result: "",
      comment: ""
    })),
    quantitativeTasks: quantitativeSource.map((task) => ({ ...task })),
    pmTasks: pmSource.map((task) => ({ ...task }))
  };
}

export function resolveDeviceChecklists(
  device: Pick<
    MedicalDevice,
    "deviceType" | "name" | "qualitativeTasks" | "quantitativeTasks" | "pmTasks"
  >
): {
  qualitativeTasks: QualitativeTask[];
  quantitativeTasks: QuantitativeTask[];
  pmTasks: PmTask[];
} {
  const defaults = createDefaultChecklistsForDevice(device.deviceType, device.name);
  return {
    qualitativeTasks: device.qualitativeTasks && device.qualitativeTasks.length > 0
      ? device.qualitativeTasks
      : defaults.qualitativeTasks,
    quantitativeTasks: device.quantitativeTasks && device.quantitativeTasks.length > 0
      ? device.quantitativeTasks
      : defaults.quantitativeTasks,
    pmTasks: device.pmTasks && device.pmTasks.length > 0
      ? device.pmTasks
      : defaults.pmTasks
  };
}

export default function IPMWorkflow({ 
  devices, 
  onPassQA, 
  onFailQA, 
  onFailQAToReporting,
  onOpenDeviceDetail,
  onSaveDraft,
  onOpenRegisterForm,
  userRole = "admin"
}: IPMWorkflowProps) {
  const canEdit = userRole === "admin" || userRole === "ipm";

  // Filter devices in IPM stage
  const ipmDevices = devices.filter((d) => d.status === "IPM");

  const isReturnedFromReporting = (device: MedicalDevice) => {
    return !!(device.history && device.history.length > 0 && device.history[0]?.action === "ส่งกลับไปแก้ไข (Returned to IPM)");
  };

  const [selectedProvince, setSelectedProvince] = useState<"ทั้งหมด" | "ตัวอย่างเหนือ" | "ตัวอย่างกลาง">("ทั้งหมด");
  const [selectedHospital, setSelectedHospital] = useState<string>("ทั้งหมด");
  const [ipmSourceFilter, setIpmSourceFilter] = useState<"all" | "regular" | "repair" | "returned">("all");

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

  const filteredIpmDevices = ipmDevices.filter((device) => {
    // Filter by Province first
    if (selectedProvince !== "ทั้งหมด") {
      if (getDeviceProvince(device) !== selectedProvince) return false;
    }
    // Filter by Hospital next
    if (selectedHospital !== "ทั้งหมด") {
      const isMatch = device.location === selectedHospital || device.department === selectedHospital;
      if (!isMatch) return false;
    }
    // Filter by Source (regular vs repair vs returned)
    const isReturned = isReturnedFromReporting(device);
    const hasBeenRepaired = !!(device.repairDetails || device.repairTechnician) && !isReturned;

    if (ipmSourceFilter === "regular") {
      if (hasBeenRepaired || isReturned) return false;
    }
    if (ipmSourceFilter === "repair" && !hasBeenRepaired) return false;
    if (ipmSourceFilter === "returned" && !isReturned) return false;
    
    return true;
  });

  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("All");

  // Reset machine type filter when location filters change
  useEffect(() => {
    setDeviceTypeFilter("All");
  }, [selectedProvince, selectedHospital, ipmSourceFilter]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(() => {
    return localStorage.getItem("active_ipm_device_id") || null;
  });

  // Keep selectedDeviceId in localStorage
  useEffect(() => {
    if (selectedDeviceId) {
      localStorage.setItem("active_ipm_device_id", selectedDeviceId);
    } else {
      localStorage.removeItem("active_ipm_device_id");
    }
  }, [selectedDeviceId]);

  // Auto-select first device if none selected or if previous selected device is no longer in IPM devices
  useEffect(() => {
    if (ipmDevices.length > 0) {
      if (!selectedDeviceId || !ipmDevices.some(d => d.id === selectedDeviceId)) {
        const defaultId = ipmDevices[0].id;
        setSelectedDeviceId(defaultId);
      }
    }
  }, [ipmDevices]);

  const activeDevice = devices.find((d) => d.id === selectedDeviceId);
  const hasStoredChecklistGap = Boolean(
    activeDevice && (
      !activeDevice.qualitativeTasks?.length
      || !activeDevice.quantitativeTasks?.length
      || !activeDevice.pmTasks?.length
    )
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sub-tabs within the IPM Sheet
  const [activeSubTab, setActiveSubTab] = useState<"info" | "qualitative" | "quantitative" | "pm">("info");

  // IPM Form States (to be initialized on activeDevice change)
  const [ipmTypesState, setIpmTypesState] = useState<string[]>([]);
  const [tempState, setTempState] = useState<number | "">("");
  const [humidityState, setHumidityState] = useState<number | "">("");

  const [apparatusState, setApparatusState] = useState<any[]>([]);
  const [qualitativeState, setQualitativeState] = useState<any[]>([]);
  const [quantitativeState, setQuantitativeState] = useState<any[]>([]);
  const [pmState, setPmState] = useState<any[]>([]);
  
  const [remarksState, setRemarksState] = useState<string>("");
  const [ipmNotesState, setIpmNotesState] = useState<string>("");
  const [remarksError, setRemarksError] = useState<string | null>(null);
  const [biomedEngineerNameState, setBiomedEngineerNameState] = useState<string>("");
  const [biomedEngineerDateState, setBiomedEngineerDateState] = useState<string>("");
  const [headBiomedNameState, setHeadBiomedNameState] = useState<string>("");
  const [headBiomedDateState, setHeadBiomedDateState] = useState<string>("");
  const [biomedSignatureImageState, setBiomedSignatureImageState] = useState<string>("");
  const [headBiomedSignatureImageState, setHeadBiomedSignatureImageState] = useState<string>("");

  // Initialize form state when a device is selected
  useEffect(() => {
    if (activeDevice) {
      setIpmTypesState(activeDevice.ipmTypes || []);
      setTempState(activeDevice.temperature !== undefined ? activeDevice.temperature : "");
      setHumidityState(activeDevice.humidity !== undefined ? activeDevice.humidity : "");
      
      const useVentilator = isVentilatorDevice(activeDevice.deviceType, activeDevice.name);
      const usePatientMonitor = isPatientMonitorDevice(activeDevice.deviceType, activeDevice.name);
      const useSpO2 = isSpO2Device(activeDevice.deviceType, activeDevice.name);
      const useDoptone = isDoptoneDevice(activeDevice.deviceType, activeDevice.name);
      const useNIBP = isNIBPDevice(activeDevice.deviceType, activeDevice.name);
      const useAED = isAedDevice(activeDevice.deviceType, activeDevice.name);
      const useDefib = isDefibDevice(activeDevice.deviceType, activeDevice.name);
      const useEcg = isEcgDevice(activeDevice.deviceType, activeDevice.name);
      const useWeight = isWeightDevice(activeDevice.deviceType, activeDevice.name);
      const useCentrifuge = isCentrifugeDevice(activeDevice.deviceType, activeDevice.name);
      const useSyringe = isSyringePumpDevice(activeDevice.deviceType, activeDevice.name);
      const useInfusion = isInfusionPumpDevice(activeDevice.deviceType, activeDevice.name);
      const useOxygen = isOxygenDevice(activeDevice.deviceType, activeDevice.name);
      const useThermometer = isThermometerDevice(activeDevice.deviceType, activeDevice.name);
      const useSphygmomanometer = isSphygmomanometerDevice(activeDevice.deviceType, activeDevice.name);
      const useFetalMonitor = isFetalMonitorDevice(activeDevice.deviceType, activeDevice.name);

      let defaultApparatus = [
        { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
        { equipment: "INCU Incubator Analyzer", manufacturer: "Fluke Biomedical", brandModel: "INCU II", serialNo: "SN-9981", certificateNo: "CAL-2026-002", calDueDate: "11/2026" },
        { equipment: "Digital Stopwatch", manufacturer: "Casio", brandModel: "HS-3", serialNo: "SN-7711", certificateNo: "CAL-2026-003", calDueDate: "08/2027" }
      ];

      if (useSphygmomanometer) {
        defaultApparatus = [
          { equipment: "Parameter Tester", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useVentilator) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
          { equipment: "Ventilator Analyzer", manufacturer: "Fluke Biomedical", brandModel: "VT650", serialNo: "SN-55620", certificateNo: "CAL-2026-009", calDueDate: "10/2026" }
        ];
      } else if (usePatientMonitor) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
          { equipment: "NIBP Tester", manufacturer: "Fluke Biomedical", brandModel: "BP Pump 2", serialNo: "SN-44321", certificateNo: "CAL-2026-008", calDueDate: "11/2026" }
        ];
      } else if (useSpO2) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "NIBP Tester(or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useDoptone) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
          { equipment: "Acoustic / Doppler Simulator", manufacturer: "Fluke Biomedical", brandModel: "Doppler Sim II", serialNo: "SN-30291", certificateNo: "CAL-2026-015", calDueDate: "09/2027" }
        ];
      } else if (useNIBP) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
          { equipment: "NIBP Tester", manufacturer: "Fluke Biomedical", brandModel: "BP Pump 2", serialNo: "SN-44321", certificateNo: "CAL-2026-008", calDueDate: "11/2026" },
          { equipment: "SpO2 Tester", manufacturer: "Fluke Biomedical", brandModel: "Index 2XL", serialNo: "SN-55910", certificateNo: "CAL-2026-012", calDueDate: "08/2027" }
        ];
      } else if (useInfusion || useSyringe) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer", manufacturer: "Fluke Biomedical", brandModel: "ESA615", serialNo: "SN-2451001", certificateNo: "CAL-2026-001", calDueDate: "12/2026" },
          { equipment: "Infusion Device Analyzer", manufacturer: "Fluke Biomedical", brandModel: "IDA-1S", serialNo: "SN-88410", certificateNo: "CAL-2026-005", calDueDate: "09/2026" }
        ];
      } else if (useCentrifuge) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Tachometer", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Stopwatch", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useAED) {
        defaultApparatus = [
          { equipment: "Defibrillator Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useDefib) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Defibrillator Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Multimeter(or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useEcg) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "ECG Simulator(or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useOxygen) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Flow Tester", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Pressure Tester", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useWeight) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Steel Weights (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useThermometer) {
        defaultApparatus = [
          { equipment: "Digital Multi meter with temp", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      } else if (useFetalMonitor) {
        defaultApparatus = [
          { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
          { equipment: "Fetal Heart Simulators (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
        ];
      }

      setApparatusState(
        activeDevice.testApparatus && activeDevice.testApparatus.length > 0
          ? activeDevice.testApparatus
          : defaultApparatus
      );
      
      const resolvedChecklists = resolveDeviceChecklists(activeDevice);
      setQualitativeState(resolvedChecklists.qualitativeTasks);
      setQuantitativeState(resolvedChecklists.quantitativeTasks);
      setPmState(resolvedChecklists.pmTasks);
      
      setRemarksState(activeDevice.remarks || "");
      setIpmNotesState(activeDevice.ipmNotes || "");
      setBiomedEngineerNameState(activeDevice.biomedSignatureName || "");
      setBiomedEngineerDateState(activeDevice.biomedSignatureDate || "");
      setHeadBiomedNameState(activeDevice.headBiomedSignatureName || "");
      setHeadBiomedDateState(activeDevice.headBiomedSignatureDate || "");
      setBiomedSignatureImageState(activeDevice.biomedSignatureImage || "");
      setHeadBiomedSignatureImageState(activeDevice.headBiomedSignatureImage || "");
      setRemarksError(null);
      setActiveSubTab("info");
    }
  }, [selectedDeviceId]);

  const resetForm = () => {
    setSelectedDeviceId(null);
    setRemarksError(null);
    setIpmNotesState("");
  };

  const handleLoadDefaultChecklists = () => {
    if (!activeDevice || !canEdit) return;

    const defaults = createDefaultChecklistsForDevice(activeDevice.deviceType, activeDevice.name);
    setQualitativeState(defaults.qualitativeTasks);
    setQuantitativeState(defaults.quantitativeTasks);
    setPmState(defaults.pmTasks);

    if (onSaveDraft) {
      onSaveDraft({
        ...activeDevice,
        ...defaults
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Checklist updates handlers
  const handleIpmTypeCheckbox = (type: string, checked: boolean) => {
    if (checked) {
      setIpmTypesState((prev) => [...prev, type]);
    } else {
      setIpmTypesState((prev) => prev.filter((t) => t !== type));
    }
  };

  const handleApparatusChange = (index: number, field: string, value: string) => {
    setApparatusState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addApparatusRow = () => {
    setApparatusState((prev) => [
      ...prev,
      { equipment: "", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
    ]);
  };

  const deleteApparatusRow = (index: number) => {
    setApparatusState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQualitativeChange = (index: number, result: "PASS" | "FAIL" | "N/A") => {
    setQualitativeState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], result };
      return updated;
    });
  };

  const handleQualitativeComment = (index: number, comment: string) => {
    setQualitativeState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], comment };
      return updated;
    });
  };

  const handleQuantitativeChange = (index: number, field: string, value: string) => {
    setQuantitativeState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleQuantitativeChangeMultiple = (index: number, fields: Record<string, string>) => {
    setQuantitativeState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };
      return updated;
    });
  };

  const handleQuantitativeResult = (index: number, result: "PASS" | "FAIL" | "N/A") => {
    setQuantitativeState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], result };
      return updated;
    });
  };

  const handlePmChange = (index: number, field: "done" | "comment", value: any) => {
    setPmState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addQualitativeRow = () => {
    setQualitativeState((prev) => [
      ...prev,
      { taskName: "รายการเพิ่มใหม่ (ซ้าย)", result: "" as any, comment: "" },
      { taskName: "รายการเพิ่มใหม่ (ขวา)", result: "" as any, comment: "" }
    ]);
  };

  const deleteQualitativeRow = (leftIdx: number, rightIdx: number | null) => {
    setQualitativeState((prev) => prev.filter((_, i) => i !== leftIdx && (rightIdx === null || i !== rightIdx)));
  };

  const addQuantitativeSubRow = (groupLabel: string, criteria: string) => {
    setQuantitativeState((prev) => {
      let lastIndex = -1;
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].groupLabel === groupLabel) {
          lastIndex = i;
        }
      }
      const newRow = {
        groupLabel,
        criteria,
        setting: "",
        display: "",
        measured: "",
        result: "" as any
      };
      if (lastIndex !== -1) {
        const updated = [...prev];
        updated.splice(lastIndex + 1, 0, newRow);
        return updated;
      } else {
        return [...prev, newRow];
      }
    });
  };

  const addQuantitativeGroup = () => {
    setQuantitativeState((prev) => [
      ...prev,
      {
        groupLabel: "กลุ่มรายการใหม่",
        criteria: "ระบุเกณฑ์",
        setting: "",
        display: "",
        measured: "",
        result: "" as any
      }
    ]);
  };

  const deleteQuantitativeRow = (index: number) => {
    setQuantitativeState((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteQuantitativeGroup = (groupLabel: string) => {
    setQuantitativeState((prev) => prev.filter((item) => item.groupLabel !== groupLabel));
  };

  const addPmRow = () => {
    setPmState((prev) => [
      ...prev,
      { taskName: "งานบำรุงรักษาใหม่", done: false, comment: "" }
    ]);
  };

  const deletePmRow = (index: number) => {
    setPmState((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission compilation
  const getSubmissionDetails = () => {
    return {
      ipmTypes: ipmTypesState,
      temperature: tempState === "" ? (activeDevice?.temperature ?? 0) : tempState,
      humidity: humidityState === "" ? (activeDevice?.humidity ?? 0) : humidityState,
      testApparatus: apparatusState,
      qualitativeTasks: qualitativeState,
      quantitativeTasks: quantitativeState,
      pmTasks: pmState,
      remarks: remarksState,
      ipmNotes: ipmNotesState,
      biomedSignatureName: biomedEngineerNameState,
      biomedSignatureDate: biomedEngineerDateState,
      headBiomedSignatureName: headBiomedNameState,
      headBiomedSignatureDate: headBiomedDateState,
      biomedSignatureImage: biomedSignatureImageState,
      headBiomedSignatureImage: headBiomedSignatureImageState
    };
  };

  const handleSaveDraft = () => {
    if (!selectedDeviceId || !activeDevice) return;
    const details = getSubmissionDetails();
    if (onSaveDraft) {
      const updatedDevice: MedicalDevice = {
        ...activeDevice,
        ...details,
        ipmTester: biomedEngineerNameState || activeDevice.ipmTester,
        ipmCheckDate: biomedEngineerDateState || activeDevice.ipmCheckDate
      };
      onSaveDraft(updatedDevice);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
  };

  const handlePass = () => {
    if (!selectedDeviceId) return;
    const details = getSubmissionDetails();
    const notes = ipmNotesState.trim() || remarksState.trim() || "ผ่านเกณฑ์ตรวจเช็คความปลอดภัยทางไฟฟ้านิวเมติกส์และประสิทธิภาพแล้ว";
    onPassQA(selectedDeviceId, notes, biomedEngineerNameState || "Sample Technician", details);
    resetForm();
  };

  const handleFail = () => {
    if (!selectedDeviceId) return;
    
    // Validate if they entered defect symptoms (อาการชำรุด)
    if (!ipmNotesState.trim()) {
      setRemarksError("* กรุณาระบุรายละเอียดอาการชำรุดเมื่อส่งซ่อม");
      return;
    }
    
    const finalNotes = ipmNotesState.trim();
    
    setRemarksError(null);
    const details = {
      ...getSubmissionDetails(),
      remarks: remarksState.trim() || finalNotes,
      ipmNotes: finalNotes
    };
    onFailQA(selectedDeviceId, finalNotes, biomedEngineerNameState || "Sample Technician", details);
    resetForm();
  };

  const handleApproveAsFailed = () => {
    if (!selectedDeviceId) return;
    
    // Validate if they entered notes
    if (!ipmNotesState.trim()) {
      setRemarksError("* กรุณาระบุหมายเหตุหรือเหตุผลในการปิดเคสแบบไม่ผ่านเกณฑ์");
      return;
    }
    
    const finalNotes = ipmNotesState.trim();
    
    setRemarksError(null);
    const details = {
      ...getSubmissionDetails(),
      remarks: remarksState.trim() || finalNotes,
      ipmNotes: finalNotes
    };
    onFailQAToReporting(selectedDeviceId, finalNotes, biomedEngineerNameState || "Sample Technician", details);
    resetForm();
  };

  // Calculating progress stats for badges
  const getQualitativeStats = () => {
    const total = qualitativeState.length;
    const passed = qualitativeState.filter(q => q.result === "PASS").length;
    const failed = qualitativeState.filter(q => q.result === "FAIL").length;
    return { total, passed, failed };
  };

  const getQuantitativeStats = () => {
    const total = quantitativeState.length;
    const passed = quantitativeState.filter(q => q.result === "PASS").length;
    const failed = quantitativeState.filter(q => q.result === "FAIL").length;
    return { total, passed, failed };
  };

  const getPmStats = () => {
    const total = pmState.length;
    const done = pmState.filter(p => p.done).length;
    return { total, done };
  };

  const qualStats = getQualitativeStats();
  const quantStats = getQuantitativeStats();
  const pmStats = getPmStats();

  return (
    <div className="space-y-6" id="ipm-tab">
      {!canEdit && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <span>คุณกำลังเข้าชมข้อมูลในโหมดผู้สังเกตการณ์ (View Only) เนื่องจากสิทธิ์การบันทึกข้อมูลและเซ็นชื่อรับรองถูกจำกัดไว้เฉพาะเจ้าหน้าที่ฝ่าย IPM และผู้ดูแลระบบเท่านั้น</span>
        </div>
      )}

      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-800">
          ฝ่ายตรวจสอบความปลอดภัยและประสิทธิภาพ (Clinical IPM Inspection)
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-1">
          การบันทึกรายงานทดสอบความปลอดภัยทางไฟฟ้าชีวการแพทย์ และวิเคราะห์ประสิทธิภาพตู้อบเด็กทารกแรกเกิดตามแบบฟอร์มมาตรฐาน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Awaiting QA Device Cards List */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Province & Hospital Selectors for IPM Department */}
          <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            {/* Segmented control for Province switching */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/50">
              {[
                { id: "ทั้งหมด", label: "ทั้งหมด" },
                { id: "ตัวอย่างเหนือ", label: "ตัวอย่างเหนือ" },
                { id: "ตัวอย่างกลาง", label: "ตัวอย่างกลาง" }
              ].map((p) => {
                const isActive = selectedProvince === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProvince(p.id as any);
                      setSelectedHospital("ทั้งหมด");
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-1 ${
                      isActive
                        ? "bg-[#1b3a82] text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                    }`}
                  >
                    <MapPin className={`h-3 w-3 ${isActive ? "text-white animate-pulse" : "text-slate-400"}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selector for Hospital */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/50">
              <span className="text-[10px] font-extrabold text-[#1b3a82] uppercase tracking-wider shrink-0">รพ.สต.:</span>
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

            {/* IPM Source Filter */}
            <div className="flex bg-slate-150/60 p-1 rounded-xl border border-slate-200/40">
              {[
                { id: "all", label: "ทั้งหมด", count: ipmDevices.length },
                { id: "regular", label: "ทั่วไป", count: ipmDevices.filter(d => !(d.repairDetails || d.repairTechnician) && !isReturnedFromReporting(d)).length },
                { id: "repair", label: "รับจากฝ่ายซ่อม", count: ipmDevices.filter(d => !!(d.repairDetails || d.repairTechnician) && !isReturnedFromReporting(d)).length },
                { id: "returned", label: "ส่งกลับจากรายงานผล", count: ipmDevices.filter(d => isReturnedFromReporting(d)).length },
              ].map((tab) => {
                const isActive = ipmSourceFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setIpmSourceFilter(tab.id as any)}
                    className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#1b3a82] text-white shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              รายการเครื่องรอตรวจสอบ ({filteredIpmDevices.length} เครื่อง)
            </h3>
          </div>

          {/* Machine Type Filter Pills */}
          {filteredIpmDevices.length > 0 && (
            <div className="bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
              <span className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider pl-1">
                แยกตามชนิดเครื่องมือแพทย์:
              </span>
              <div className="flex flex-wrap gap-1">
                {["All", ...Array.from(new Set(filteredIpmDevices.map(d => d.name)))].map((type) => {
                  const count = type === "All" 
                    ? filteredIpmDevices.length 
                    : filteredIpmDevices.filter(d => d.name === type).length;
                  const isSelected = deviceTypeFilter === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDeviceTypeFilter(type)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#1b3a82] text-white border-[#1b3a82] shadow-sm"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span>{type === "All" ? "ทั้งหมด" : type}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 font-bold"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ipmDevices.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-10 rounded-2xl text-center text-slate-400">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">ไม่มีเครื่องมือแพทย์รอตรวจในขณะนี้</p>
              <p className="text-xs mt-1">คุณสามารถขึ้นทะเบียนหรือส่งเครื่องเพิ่มเติมได้จากฝ่ายลงทะเบียน</p>
            </div>
          ) : filteredIpmDevices.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-10 rounded-2xl text-center text-slate-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">ไม่พบเครื่องรอตรวจในพื้นที่ที่เลือก</p>
              <p className="text-xs mt-1">กรุณาเลือก รพ.สต. หรือจังหวัดอื่นที่มีเครื่องรอตรวจสอบอยู่</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
              {/* Section 1: Received from Repair */}
              {(() => {
                const repairIpmDevices = filteredIpmDevices.filter(d => !!(d.repairDetails || d.repairTechnician) && !isReturnedFromReporting(d));
                const filteredRepairs = deviceTypeFilter === "All" 
                  ? repairIpmDevices 
                  : repairIpmDevices.filter(d => d.name === deviceTypeFilter);
                
                if (filteredRepairs.length === 0) return null;
                
                return (
                  <div className="space-y-3 bg-amber-50/10 border border-amber-200/50 p-3 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-amber-200/30 pb-2 mb-1">
                      <span className="text-[11px] font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                        🛠️ เฉพาะที่ได้รับมาจากฝ่ายซ่อมบำรุง ({filteredRepairs.length})
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredRepairs.map((device) => {
                        const isSelected = selectedDeviceId === device.id;
                        return (
                          <div
                            key={device.id}
                            onClick={() => setSelectedDeviceId(device.id)}
                            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/50 border-blue-500 shadow-sm scale-[1.01]"
                                : "bg-amber-50/30 border-amber-150 hover:border-amber-300 shadow-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono font-bold text-xs text-blue-600">{device.id}</span>
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                                <span className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-pulse"></span>
                                ซ่อมเสร็จรอตรวจซ้ำ
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-800 text-sm mb-1">{device.name}</h4>
                            <p className="text-[11px] text-slate-400 font-sans">
                              รหัสรายงาน IPM: <span className="font-mono font-semibold text-slate-600">{device.ipmReport}</span>
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                              <span>แผนก: <strong className="text-slate-700">{device.department}</strong></span>
                              <span className="text-blue-600 font-bold hover:underline">
                                เริ่มการตรวจเช็ค &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Section 2: Regular Queue */}
              {(() => {
                const regularIpmDevices = filteredIpmDevices.filter(d => !(d.repairDetails || d.repairTechnician) && !isReturnedFromReporting(d));
                const filteredRegulars = deviceTypeFilter === "All" 
                  ? regularIpmDevices 
                  : regularIpmDevices.filter(d => d.name === deviceTypeFilter);
                
                if (filteredRegulars.length === 0) return null;
                
                return (
                  <div className="space-y-3">
                    {(filteredIpmDevices.some(d => !!(d.repairDetails || d.repairTechnician)) || filteredIpmDevices.some(d => isReturnedFromReporting(d))) && (
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
                        <span className="text-[11px] font-black text-slate-500 flex items-center gap-1.5 uppercase tracking-wide">
                          📋 เครื่องรอตรวจเช็คตามปกติ ({filteredRegulars.length})
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {Object.entries(
                        filteredRegulars.reduce((acc, device) => {
                          if (!acc[device.name]) {
                            acc[device.name] = [];
                          }
                          acc[device.name].push(device);
                          return acc;
                        }, {} as Record<string, MedicalDevice[]>)
                      ).map(([deviceName, list]) => (
                        <div key={deviceName} className="space-y-2">
                          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
                            <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                              {deviceName}
                            </span>
                            <span className="text-[9px] font-bold bg-[#1b3a82]/10 text-[#1b3a82] px-2 py-0.5 rounded-full">
                              {list.length} เครื่อง
                            </span>
                          </div>

                          <div className="space-y-2">
                            {list.map((device) => {
                              const isSelected = selectedDeviceId === device.id;
                              return (
                                <div
                                  key={device.id}
                                  onClick={() => setSelectedDeviceId(device.id)}
                                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                                    isSelected
                                      ? "bg-blue-50/50 border-blue-500 shadow-sm scale-[1.01]"
                                      : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono font-bold text-xs text-blue-600">{device.id}</span>
                                  </div>

                                  <h4 className="font-bold text-slate-800 text-sm mb-1">{device.name}</h4>
                                  <p className="text-[11px] text-slate-400 font-sans">
                                    รหัสรายงาน IPM: <span className="font-mono font-semibold text-slate-600">{device.ipmReport}</span>
                                  </p>

                                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                                    <span>แผนก: <strong className="text-slate-700">{device.department}</strong></span>
                                    <span className="text-blue-600 font-bold hover:underline">
                                      เริ่มการตรวจเช็ค &rarr;
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Section 3: Returned from Reporting Queue */}
              {(() => {
                const returnedIpmDevices = filteredIpmDevices.filter(d => isReturnedFromReporting(d));
                const filteredReturned = deviceTypeFilter === "All" 
                  ? returnedIpmDevices 
                  : returnedIpmDevices.filter(d => d.name === deviceTypeFilter);
                
                if (filteredReturned.length === 0) return null;
                
                return (
                  <div className="space-y-3 bg-rose-50/10 border border-rose-200/50 p-3 rounded-2xl">
                    <div className="flex items-center justify-between border-b border-rose-200/30 pb-2 mb-1">
                      <span className="text-[11px] font-black text-rose-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                        ⚠️ ส่งกลับแก้ไขจากฝ่ายรายงานผล ({filteredReturned.length})
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredReturned.map((device) => {
                        const isSelected = selectedDeviceId === device.id;
                        const returnHistory = device.history?.find(h => h.action === "ส่งกลับไปแก้ไข (Returned to IPM)");
                        return (
                          <div
                            key={device.id}
                            onClick={() => setSelectedDeviceId(device.id)}
                            className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/50 border-blue-500 shadow-sm scale-[1.01]"
                                : "bg-rose-50/30 border-rose-150 hover:border-rose-300 shadow-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono font-bold text-xs text-blue-600">{device.id}</span>
                              <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                                <span className="h-1.5 w-1.5 bg-rose-600 rounded-full animate-pulse"></span>
                                ส่งกลับแก้ไขรายงาน
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-800 text-sm mb-1">{device.name}</h4>
                            <p className="text-[11px] text-slate-400 font-sans">
                              รหัสรายงาน IPM: <span className="font-mono font-semibold text-slate-600">{device.ipmReport}</span>
                            </p>
                            {returnHistory && (
                              <p className="text-[10px] text-rose-600 mt-1 bg-white/60 p-1.5 rounded border border-rose-100/50 line-clamp-2 leading-relaxed">
                                {returnHistory.note.replace("ฝ่ายรายงานผลส่งกลับให้ฝ่าย IPM ตรวจสอบและแก้ไข: ", "เหตุผล: ")}
                              </p>
                            )}

                            <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                              <span>แผนก: <strong className="text-slate-700">{device.department}</strong></span>
                              <span className="text-blue-600 font-bold hover:underline">
                                แก้ไขรายงาน &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Side: Interactive Clinical IPM Compliance Sheet */}
        <div className="lg:col-span-8">
          {activeDevice ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
              
              {/* Device Header Block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest font-mono">
                      EQUIPMENT UNDER TEST (ข้อมูลส่วนบน ฝ่ายลงทะเบียน)
                    </span>
                    <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                      {activeDevice.name} (ID: {activeDevice.id})
                    </h3>
                  </div>
                  <button 
                    onClick={() => onOpenDeviceDetail(activeDevice.id)}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <FileText className="h-3 w-3" />
                    ประวัติเครื่อง
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-slate-600 font-sans">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Equipment No.:</span>
                    <strong>{activeDevice.equipmentNo}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">IPM Round:</span>
                    <strong>{activeDevice.ipmRound}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">IPM Date:</span>
                    <strong>{activeDevice.ipmDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">IPM Due Date:</span>
                    <strong>{activeDevice.ipmDueDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Manufacturer:</span>
                    <strong>{activeDevice.manufacturer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Model:</span>
                    <strong>{activeDevice.model}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Serial Number:</span>
                    <strong>{activeDevice.serialNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Location:</span>
                    <strong>{activeDevice.location} ({activeDevice.department})</strong>
                  </div>
                </div>
              </div>

              {/* If received from repair, display a prominent warning/info card for the QA officer */}
              {!!(activeDevice.repairDetails || activeDevice.repairTechnician) && (
                <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                    <Wrench className="h-5 w-5 animate-bounce" />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-2">
                      <span>🛠️ ข้อมูลเฉพาะที่ได้รับมาจากฝ่ายซ่อมบำรุง (Returned for QA Re-Evaluation)</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      เครื่องมือแพทย์ชิ้นนี้ผ่านการแก้ไข/ซ่อมแซมและส่งกลับมาเพื่อทำการสอบเทียบและตรวจสอบความปลอดภัยทางวิศวกรรมชีวการแพทย์ (IPM / QA) ซ้ำอีกครั้ง โปรดทดสอบความปลอดภัยอย่างละเอียดถี่ถ้วน
                    </p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-lg border border-amber-100">
                      <div>
                        <span className="text-slate-400 font-medium">ช่างผู้รับผิดชอบซ่อมบำรุง:</span>{" "}
                        <strong className="text-slate-700">{activeDevice.repairTechnician || "ไม่ระบุ"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">วันที่ส่งซ่อมกลับคืน:</span>{" "}
                        <strong className="text-slate-700 font-mono">{activeDevice.repairDate || "ไม่ระบุ"}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 font-medium block mb-0.5">รายละเอียดผลการซ่อม/เปลี่ยนอะไหล่:</span>
                        <p className="font-bold text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-150 text-[10.5px]">
                          {activeDevice.repairDetails || "ไม่ได้ระบุรายละเอียด"}
                        </p>
                      </div>
                      {typeof activeDevice.repairCost === "number" && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 font-medium">ค่าซ่อมบำรุง:</span>{" "}
                          <strong className="text-amber-900 font-black">{activeDevice.repairCost.toLocaleString()} บาท</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* If received from reporting return, display a prominent warning/info card for the QA officer */}
              {isReturnedFromReporting(activeDevice) && (
                <div className="bg-rose-50 border border-rose-200/80 p-4 rounded-2xl flex gap-3.5 items-start">
                  <div className="p-2 bg-rose-100 text-rose-800 rounded-xl shrink-0 mt-0.5 animate-bounce">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="space-y-1.5 w-full">
                    <h4 className="text-xs font-black text-rose-900 flex items-center gap-2">
                      <span>⚠️ ส่งกลับตรวจสอบและแก้ไขรายงานจากฝ่ายรายงานผล (Returned from Reporting)</span>
                    </h4>
                    <p className="text-[11px] text-rose-800 leading-relaxed">
                      เครื่องมือแพทย์ชิ้นนี้ถูกส่งกลับมาจากฝ่ายรายงานผลเพื่อขอให้ฝ่าย IPM ตรวจสอบและแก้ไขข้อมูลเพิ่มเติมหรือแก้ไขค่าที่วัดได้ตามที่แจ้งไว้ด้านล่างนี้
                    </p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-lg border border-rose-100">
                      <div>
                        <span className="text-slate-400 font-medium">ผู้ส่งกลับแก้ไข:</span>{" "}
                        <strong className="text-slate-700">
                          {activeDevice.history?.find(h => h.action === "ส่งกลับไปแก้ไข (Returned to IPM)")?.user || "ฝ่ายรายงานผล"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">วันที่ส่งกลับคืน:</span>{" "}
                        <strong className="text-slate-700 font-mono">
                          {activeDevice.history?.find(h => h.action === "ส่งกลับไปแก้ไข (Returned to IPM)")?.date || "ไม่ระบุ"}
                        </strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 font-medium block mb-0.5">เหตุผลและจุดที่ต้องปรับปรุงแก้ไข:</span>
                        <p className="font-bold text-rose-900 bg-rose-50 p-2 rounded border border-rose-150 text-[10.5px] whitespace-pre-wrap leading-relaxed">
                          {activeDevice.history?.find(h => h.action === "ส่งกลับไปแก้ไข (Returned to IPM)")?.note?.replace("ฝ่ายรายงานผลส่งกลับให้ฝ่าย IPM ตรวจสอบและแก้ไข: ", "") || "ไม่ได้ระบุรายละเอียด"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* IPM Section Internal Sub-Tabs */}
              <div className="flex border-b border-slate-100 gap-1 overflow-x-auto pb-px">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("info")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === "info"
                      ? "border-blue-600 text-blue-600 bg-blue-50/20"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  1. ข้อมูลทดสอบ &amp; เครื่องมือ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("qualitative")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === "qualitative"
                      ? "border-blue-600 text-blue-600 bg-blue-50/20"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  2. ตรวจสอบคุณภาพกายภาพ ({qualStats.passed}/{qualStats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("quantitative")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === "quantitative"
                      ? "border-blue-600 text-blue-600 bg-blue-50/20"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  3. สอบเทียบประสิทธิภาพ ({quantStats.passed}/{quantStats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab("pm")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === "pm"
                      ? "border-blue-600 text-blue-600 bg-blue-50/20"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  4. บำรุงรักษา &amp; ลงนาม ({pmStats.done}/{pmStats.total})
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="space-y-4 font-sans text-xs">
                {hasStoredChecklistGap && canEdit && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-extrabold">อุปกรณ์นี้ยังไม่มีรายการตรวจมาตรฐานครบถ้วน</p>
                        <p className="mt-0.5 text-[11px] font-medium text-amber-800">
                          ระบบแสดงรายการมาตรฐานให้ชั่วคราวแล้ว กดปุ่มเพื่อบันทึกรายการตามชนิดเครื่องลงในฐานข้อมูล
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLoadDefaultChecklists}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-[11px] font-extrabold text-white shadow-sm transition-all hover:bg-amber-700 active:scale-95"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      ดึงรายการตรวจมาตรฐาน
                    </button>
                  </div>
                )}
                
                {saveSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-xs font-semibold shadow-sm animate-in fade-in duration-150">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 animate-bounce" />
                    <div>
                      <p className="font-extrabold text-[#115e59]">บันทึกข้อมูลร่างเสร็จสมบูรณ์! (Draft Saved Successfully)</p>
                      <p className="font-medium opacity-90 mt-0.5">ข้อมูลความปลอดภัยทางไฟฟ้า ค่าประสิทธิภาพที่วัดได้ และบันทึกเพิ่มเติมได้รับการเซฟแบบร่างเข้าสู่ระบบแล้วอย่างเรียบร้อย</p>
                    </div>
                  </div>
                )}
                
                {/* SUB TAB 1: IPM INFO & APPARATUS */}
                {activeSubTab === "info" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150">
                    {/* Lab Environment & IPM Types */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: IPM Type Selection */}
                      <div className="space-y-2 border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                        <label className="block text-xs font-bold text-slate-700">IPM Type (ประเภทการตรวจสอบ):</label>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {["IPM Planning", "Re-IPM", "New Equipment", "Post Repair", "IPM Miss Planning", "Other"].map((type) => {
                            const isChecked = ipmTypesState.includes(type);
                            return (
                              <label key={type} className="flex items-center gap-1.5 cursor-pointer p-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleIpmTypeCheckbox(type, e.target.checked)}
                                  className="h-3.5 w-3.5 border-slate-300 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-slate-600">{type}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Environment Monitoring */}
                      <div className="space-y-3 border border-slate-100 p-4 rounded-xl bg-slate-50/30">
                        <label className="block text-xs font-bold text-slate-700">Lab Environment (สภาวะแวดล้อมห้องทดสอบ):</label>
                        <div className="space-y-3 font-sans">
                          <div>
                            <span className="flex items-center gap-1 text-slate-500 mb-1">
                              <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                              Ambient Temperature (°C) [เกณฑ์: 15 - 30 °C]
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              value={tempState}
                              onChange={(e) => setTempState(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                          <div>
                            <span className="flex items-center gap-1 text-slate-500 mb-1">
                              <Droplets className="h-3.5 w-3.5 text-blue-500" />
                              Relative Humidity (%) [เกณฑ์: 30 - 75 %]
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              value={humidityState}
                              onChange={(e) => setHumidityState(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Test Apparatus calibration list */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1b3a82] flex items-center gap-1.5 uppercase tracking-wider">
                          <Activity className="h-4 w-4" />
                          Test Apparatus (รายการเครื่องมือวัดที่ใช้ทดสอบ)
                        </h4>
                        <button
                          type="button"
                          onClick={addApparatusRow}
                          className="px-3 py-1.5 border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50/50 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                          + เพิ่มอุปกรณ์
                        </button>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-[#1b3a82] text-white font-bold uppercase text-[10px] tracking-wider">
                              <th className="p-2.5 w-1/4 border-r border-blue-900">Equipment</th>
                              <th className="p-2.5 border-r border-blue-900">Manufacturer</th>
                              <th className="p-2.5 border-r border-blue-900">Brand / Model</th>
                              <th className="p-2.5 border-r border-blue-900">Serial No.</th>
                              <th className="p-2.5 border-r border-blue-900">Certificate No.</th>
                              <th className="p-2.5 border-r border-blue-900">Cal. Due Date</th>
                              <th className="p-2.5 text-center w-[50px]"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {apparatusState.map((row, index) => (
                              <tr key={index} className="hover:bg-slate-50/50">
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.equipment}
                                    onChange={(e) => handleApparatusChange(index, "equipment", e.target.value)}
                                    placeholder="e.g. Simulator"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.manufacturer}
                                    onChange={(e) => handleApparatusChange(index, "manufacturer", e.target.value)}
                                    placeholder="e.g. Fluke"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.brandModel}
                                    onChange={(e) => handleApparatusChange(index, "brandModel", e.target.value)}
                                    placeholder="e.g. INCU II"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.serialNo}
                                    onChange={(e) => handleApparatusChange(index, "serialNo", e.target.value)}
                                    placeholder="S/N"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 font-mono text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.certificateNo}
                                    onChange={(e) => handleApparatusChange(index, "certificateNo", e.target.value)}
                                    placeholder="เลขที่ใบรับรอง"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 font-mono text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5">
                                  <input
                                    type="text"
                                    value={row.calDueDate}
                                    onChange={(e) => handleApparatusChange(index, "calDueDate", e.target.value)}
                                    placeholder="วว/ดด/ปปปป"
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 font-mono text-[11px]"
                                  />
                                </td>
                                <td className="p-1.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => deleteApparatusRow(index)}
                                    className="p-1.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-500 rounded-xl h-8 w-8 flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm"
                                    title="ลบเครื่องมือวัด"
                                  >
                                    <Trash2 className="h-4 w-4 stroke-[2]" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: QUALITATIVE CHECKS */}
                {activeSubTab === "qualitative" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-[#1b3a82] flex items-center gap-1.5 uppercase tracking-wider">
                        <CheckCircle className="h-4 w-4" />
                        IPM Result (ตรวจสอบเชิงคุณภาพ กายภาพและระบบเชิงปริมาณเบื้องต้น)
                      </h4>
                      <button
                        type="button"
                        onClick={addQualitativeRow}
                        className="px-3 py-1.5 border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50/50 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                        + เพิ่มรายการ (2 คอลัมน์)
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl shadow-sm max-h-[500px] overflow-auto">
                      <table className="w-full text-left border-collapse text-[11px] min-w-[980px]">
                        <thead>
                          {/* Dark Blue Main Header Group */}
                          <tr className="bg-[#1b3a82] text-white text-center font-bold">
                            <th colSpan={12} className="py-2.5 text-[11px] uppercase tracking-wider text-center border-b border-blue-900">
                              QUALITATIVE TASKS {isSphygmomanometerDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Sphygmomanometer / เครื่องวัดความดันโลหิตแบบแมนนวล)" : isOxygenDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Oxygen Concentrator / เครื่องผลิตออกซิเจน)" : isAedDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: AED / เครื่องกระตุกหัวใจอัตโนมัติ AED)" : isDefibDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Defibrillator / เครื่องกระตุกหัวใจ)" : isEcgDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Electrocardiograph / เครื่องคลื่นไฟฟ้าหัวใจ)" : isThermometerDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Infrared Thermometer / เครื่องวัดอุณหภูมิอินฟราเรด)" : isWeightDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Weighing Scale / Weight Machine / เครื่องชั่งน้ำหนัก)" : isSpO2Device(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Pulse Oximeter / SpO2 / เครื่องวัดออกซิเจนในเลือด)" : isCentrifugeDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Centrifuge / เครื่องปั่นเหวี่ยงตกตะกอน)" : isSyringePumpDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Syringe Pump / เครื่องกดกระบอกยา)" : isInfusionPumpDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Infusion Pump / เครื่องให้สารละลายทางหลอดเลือดดำ)" : isVentilatorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Ventilator / เครื่องช่วยหายใจ)" : isNIBPDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: NIBP Monitor / เครื่องวัดความดันโลหิตและสัญญาณชีพ NIBP)" : isFetalMonitorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Fetal Monitor / เครื่องเฝ้าติดตามสัญญาณชีพทารกในครรภ์)" : isPatientMonitorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Patient Monitor / เครื่องเฝ้าติดตามสัญญาณชีพผู้ป่วย)" : " (QA Profile: General / เครื่องมือแพทย์ทั่วไป)"}
                            </th>
                          </tr>
                          {/* Column Headers */}
                          <tr className="bg-[#1b3a82] text-white/95 text-center font-bold text-[9px] uppercase tracking-wider sticky top-0 z-10 border-b border-blue-900/40">
                            {/* Left set */}
                            <th className="p-2 w-[4%] border-r border-blue-900/40">PASS</th>
                            <th className="p-2 w-[4%] border-r border-blue-900/40">FAIL</th>
                            <th className="p-2 w-[4%] border-r border-blue-900/40">N/A</th>
                            <th className="p-2 w-[18%] text-left border-r border-blue-900/40">Check</th>
                            <th className="p-2 w-[16%] text-left border-r border-blue-900/50">Comment</th>

                            {/* Divider spacer */}
                            <th className="p-2 w-[1%] bg-slate-100/50"></th>

                            {/* Right set */}
                            <th className="p-2 w-[4%] border-r border-blue-900/40">PASS</th>
                            <th className="p-2 w-[4%] border-r border-blue-900/40">FAIL</th>
                            <th className="p-2 w-[4%] border-r border-blue-900/40">N/A</th>
                            <th className="p-2 w-[18%] text-left border-r border-blue-900/40">Check</th>
                            <th className="p-2 w-[16%] text-left border-r border-blue-900/50">Comment</th>

                            {/* Delete Column */}
                            <th className="p-2 w-[5%] text-center border-l border-blue-900/40 text-[9px] font-bold text-white uppercase tracking-wider">DELETE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(() => {
                            const rows = [];
                            for (let i = 0; i < qualitativeState.length; i += 2) {
                              const leftItem = qualitativeState[i];
                              const leftIdx = i;
                              const rightItem = i + 1 < qualitativeState.length ? qualitativeState[i + 1] : null;
                              const rightIdx = i + 1 < qualitativeState.length ? i + 1 : null;
                              
                              rows.push(
                                <tr key={i} className="hover:bg-slate-50/40">
                                  {/* Left set inputs */}
                                  <td className="p-1.5 text-center border-r border-slate-100">
                                    <input
                                      type="radio"
                                      name={`qual-result-left-${leftIdx}`}
                                      checked={leftItem.result === "PASS"}
                                      onChange={() => handleQualitativeChange(leftIdx, "PASS")}
                                      className="w-3.5 h-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-[9px] font-bold text-slate-500 ml-1">P</span>
                                  </td>
                                  <td className="p-1.5 text-center border-r border-slate-100">
                                    <input
                                      type="radio"
                                      name={`qual-result-left-${leftIdx}`}
                                      checked={leftItem.result === "FAIL"}
                                      onChange={() => handleQualitativeChange(leftIdx, "FAIL")}
                                      className="w-3.5 h-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span className="text-[9px] font-bold text-slate-500 ml-1">F</span>
                                  </td>
                                  <td className="p-1.5 text-center border-r border-slate-100">
                                    <input
                                      type="radio"
                                      name={`qual-result-left-${leftIdx}`}
                                      checked={leftItem.result === "N/A"}
                                      onChange={() => handleQualitativeChange(leftIdx, "N/A")}
                                      className="w-3.5 h-3.5 border-slate-300 text-slate-400 focus:ring-slate-400 cursor-pointer"
                                    />
                                    <span className="text-[9px] font-bold text-slate-400 ml-1">N/A</span>
                                  </td>
                                  <td className="p-1.5 font-semibold text-slate-700 border-r border-slate-100">
                                    <input
                                      type="text"
                                      value={leftItem.taskName}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setQualitativeState((prev) => {
                                          const updated = [...prev];
                                          updated[leftIdx] = { ...updated[leftIdx], taskName: val };
                                          return updated;
                                        });
                                      }}
                                      className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-[11px] text-slate-800 focus:bg-slate-50 rounded"
                                    />
                                  </td>
                                  <td className="p-1.5 border-r border-slate-100">
                                    <input
                                      type="text"
                                      value={leftItem.comment}
                                      onChange={(e) => handleQualitativeComment(leftIdx, e.target.value)}
                                      placeholder="..."
                                      className="w-full px-1.5 py-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded text-slate-700 outline-none focus:border-blue-300 text-[11px]"
                                    />
                                  </td>

                                  {/* Divider Spacer Column */}
                                  <td className="p-1.5 bg-slate-50/50"></td>

                                  {/* Right set inputs */}
                                  {rightItem ? (
                                    <>
                                      <td className="p-1.5 text-center border-r border-slate-100">
                                        <input
                                          type="radio"
                                          name={`qual-result-right-${rightIdx}`}
                                          checked={rightItem.result === "PASS"}
                                          onChange={() => handleQualitativeChange(rightIdx!, "PASS")}
                                          className="w-3.5 h-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <span className="text-[9px] font-bold text-slate-500 ml-1">P</span>
                                      </td>
                                      <td className="p-1.5 text-center border-r border-slate-100">
                                        <input
                                          type="radio"
                                          name={`qual-result-right-${rightIdx}`}
                                          checked={rightItem.result === "FAIL"}
                                          onChange={() => handleQualitativeChange(rightIdx!, "FAIL")}
                                          className="w-3.5 h-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                        />
                                        <span className="text-[9px] font-bold text-slate-500 ml-1">F</span>
                                      </td>
                                      <td className="p-1.5 text-center border-r border-slate-100">
                                        <input
                                          type="radio"
                                          name={`qual-result-right-${rightIdx}`}
                                          checked={rightItem.result === "N/A"}
                                          onChange={() => handleQualitativeChange(rightIdx!, "N/A")}
                                          className="w-3.5 h-3.5 border-slate-300 text-slate-400 focus:ring-slate-400 cursor-pointer"
                                        />
                                        <span className="text-[9px] font-bold text-slate-400 ml-1">N/A</span>
                                      </td>
                                      <td className="p-1.5 font-semibold text-slate-700 border-r border-slate-100">
                                        <input
                                          type="text"
                                          value={rightItem.taskName}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setQualitativeState((prev) => {
                                              const updated = [...prev];
                                              updated[rightIdx!] = { ...updated[rightIdx!], taskName: val };
                                              return updated;
                                            });
                                          }}
                                          className="w-full bg-transparent border-none outline-none focus:ring-0 p-0 text-[11px] text-slate-800 focus:bg-slate-50 rounded"
                                        />
                                      </td>
                                      <td className="p-1.5 border-r border-slate-100">
                                        <input
                                          type="text"
                                          value={rightItem.comment}
                                          onChange={(e) => handleQualitativeComment(rightIdx!, e.target.value)}
                                          placeholder="..."
                                          className="w-full px-1.5 py-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded text-slate-700 outline-none focus:border-blue-300 text-[11px]"
                                        />
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td colSpan={5} className="bg-slate-50"></td>
                                    </>
                                  )}

                                  {/* Delete Column */}
                                  <td className="p-1.5 text-center border-l border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => deleteQualitativeRow(leftIdx, rightIdx)}
                                      className="p-1.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-500 rounded-xl h-8 w-8 flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm"
                                      title="ลบแถวตรวจสอบ"
                                    >
                                      <Trash2 className="h-4 w-4 stroke-[2]" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            }
                            return rows;
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Foot Summary */}
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex flex-wrap items-center gap-3 text-xs font-sans font-bold shadow-inner">
                      <span className="text-slate-700">สรุปผล Qualitative :</span>
                      <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-emerald-100/40">
                        <span className="bg-emerald-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{qualStats.passed}</span> PASS
                      </span>
                      <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-rose-100/40">
                        <span className="bg-rose-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{qualStats.failed}</span> FAIL
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-slate-200/40">
                        <span className="bg-slate-400 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{qualStats.total - qualStats.passed - qualStats.failed}</span> N/A
                      </span>
                    </div>
                  </div>
                )}

                {/* SUB TAB 3: QUANTITATIVE TESTING */}
                {activeSubTab === "quantitative" && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-[#1b3a82] flex items-center gap-1.5 uppercase tracking-wider">
                        <Activity className="h-4 w-4" />
                        Performance & Safety Calibration (สอบเทียบระบบและประสิทธิภาพวิเคราะห์เชิงปริมาณ)
                      </h4>
                      <button
                        type="button"
                        onClick={addQuantitativeGroup}
                        className="px-3 py-1.5 border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50/50 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                        + เพิ่มกลุ่มรายการใหม่
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-xl shadow-sm max-h-[500px] overflow-auto">
                      <table className="w-full text-left border-collapse text-[11px] min-w-[980px]">
                        <thead>
                          {/* Dark Blue Main Header Group */}
                          <tr className="bg-[#1b3a82] text-white text-center font-bold">
                            <th colSpan={8} className="py-2.5 text-[11px] uppercase tracking-wider text-center border-b border-blue-900">
                              QUANTITATIVE TASKS {isSphygmomanometerDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Sphygmomanometer / เครื่องวัดความดันโลหิตแบบแมนนวล)" : isOxygenDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Oxygen Concentrator / เครื่องผลิตออกซิเจน)" : isAedDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: AED / เครื่องกระตุกหัวใจอัตโนมัติ AED)" : isDefibDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Defibrillator / เครื่องกระตุกหัวใจ)" : isEcgDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Electrocardiograph / เครื่องคลื่นไฟฟ้าหัวใจ)" : isThermometerDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Infrared Thermometer / เครื่องวัดอุณหภูมิอินฟราเรด)" : isWeightDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Weighing Scale / Weight Machine / เครื่องชั่งน้ำหนัก)" : isSpO2Device(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Pulse Oximeter / SpO2 / เครื่องวัดออกิจนในเลือด)" : isCentrifugeDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Centrifuge / เครื่องปั่นเหวี่ยงตกตะกอน)" : isSyringePumpDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Syringe Pump / เครื่องกดกระบอกยา)" : isInfusionPumpDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Infusion Pump / เครื่องให้สารละลายทางหลอดเลือดดำ)" : isVentilatorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Ventilator / เครื่องช่วยหายใจ)" : isNIBPDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: NIBP Monitor / เครื่องวัดความดันโลหิตและสัญญาณชีพ NIBP)" : isFetalMonitorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Fetal Monitor / เครื่องเฝ้าติดตามสัญญาณชีพทารกในครรภ์)" : isPatientMonitorDevice(activeDevice?.deviceType, activeDevice?.name) ? " (QA Profile: Patient Monitor / เครื่องเฝ้าติดตามสัญญาณชีพผู้ป่วย)" : " (QA Profile: General / เครื่องมือแพทย์ทั่วไป)"}
                            </th>
                          </tr>

                          {/* Column Headers */}
                          <tr className="bg-[#1b3a82] text-white/95 text-center font-bold text-[9px] uppercase tracking-wider sticky top-0 z-10 border-b border-blue-900/40">
                            <th className="p-2 text-left border-r border-blue-900/40 w-3/12">Control Setting</th>
                            <th className="p-2 border-r border-blue-900/40 w-2/12">Criteria</th>
                            <th className="p-2 border-r border-blue-900/40 w-1.5/12">Setting</th>
                                                        <th className="p-2 border-r border-blue-900/40 w-1.5/12">Measured (ค่าที่วัดได้)</th>
                            <th className="p-2 border-r border-blue-900/40 w-[6%]">PASS</th>
                            <th className="p-2 border-r border-blue-900/40 w-[6%]">FAIL</th>
                            <th className="p-2 border-r border-blue-900/40 w-[6%]">N/A</th>
                            <th className="p-2 w-[6%] uppercase text-[9px] tracking-wider text-center">ACTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150 bg-white">
                          {(() => {
                            // Grouping consecutive items of quantitativeState by groupLabel
                            const groupedRows: { groupLabel: string; rows: any[] }[] = [];
                            quantitativeState.forEach((item, index) => {
                              const rawRow = { ...item, originalIndex: index };
                              if (groupedRows.length > 0 && groupedRows[groupedRows.length - 1].groupLabel === item.groupLabel) {
                                groupedRows[groupedRows.length - 1].rows.push(rawRow);
                              } else {
                                groupedRows.push({
                                  groupLabel: item.groupLabel,
                                  rows: [rawRow]
                                });
                              }
                            });

                            return groupedRows.flatMap((group, groupIdx) => {
                              return group.rows.map((row, rowIdx) => {
                                const isFirstOfGroup = rowIdx === 0;
                                const totalInGroup = group.rows.length;
                                return (
                                  <tr key={row.originalIndex} className="hover:bg-slate-50/40">
                                    {/* Group Label / Control Setting column with rowspan */}
                                    {isFirstOfGroup && (
                                      <td rowSpan={totalInGroup} className="p-2 border-r border-slate-200 bg-slate-50/40 align-middle font-bold text-slate-800 text-[11px] w-3/12">
                                        <div className="flex flex-col justify-between h-full min-h-[50px] space-y-1.5">
                                          <textarea
                                            rows={2}
                                            value={group.groupLabel}
                                            onChange={(e) => {
                                              const newVal = e.target.value;
                                              setQuantitativeState((prev) => {
                                                return prev.map((p) => p.groupLabel === group.groupLabel ? { ...p, groupLabel: newVal } : p);
                                              });
                                            }}
                                            className="bg-transparent border-none outline-none font-bold text-slate-800 text-[11px] focus:bg-slate-200/60 p-1 rounded w-full resize-none overflow-hidden min-h-[40px]"
                                          />
                                          {/* Button to add dynamic sub-row inside this group */}
                                          <button
                                            type="button"
                                            onClick={() => addQuantitativeSubRow(group.groupLabel, group.rows[0].criteria)}
                                            className="text-left text-[10px] text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-bold pt-1 border-t border-slate-200/50 w-max"
                                          >
                                            <Plus className="h-2.5 w-2.5 stroke-[3]" />
                                            + แถวพ่วง
                                          </button>
                                        </div>
                                      </td>
                                    )}

                                    {/* Criteria column per-row */}
                                    <td className="p-2 border-r border-slate-200 bg-slate-50/40 align-middle font-mono text-slate-600 text-[11px] w-2/12">
                                      <input
                                        type="text"
                                        value={row.criteria}
                                        onChange={(e) => handleQuantitativeChange(row.originalIndex, "criteria", e.target.value)}
                                        className="w-full px-1.5 py-1.5 border-none bg-transparent hover:bg-slate-100 rounded text-slate-800 outline-none focus:ring-1 focus:ring-slate-300 focus:bg-slate-100 text-[11px] font-mono text-center transition-colors"
                                      />
                                    </td>

                                    {/* Setting input */}
                                    <td className="p-2 border-r border-slate-150 w-1.5/12 text-center">
                                      <input
                                        type="text"
                                        value={row.setting || row.controlSetting || ""}
                                        onChange={(e) => handleQuantitativeChange(row.originalIndex, "setting", e.target.value)}
                                        placeholder="Setting"
                                        className="w-full px-1.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 text-[11px] font-mono text-center bg-white"
                                      />
                                    </td>

                                    {/* Measured (ค่าที่วัดได้) */}
                                    <td className="p-2 border-r border-slate-150 w-1.5/12 text-center">
                                      {(() => {
                                        const useOxygen = isOxygenDevice(activeDevice?.deviceType, activeDevice?.name);
                                        const useCentrifuge = isCentrifugeDevice(activeDevice?.deviceType, activeDevice?.name);
                                        const isSafetyOrTemp = row.groupLabel === "Ground Wire Resistance" || row.groupLabel === "Chassis Leakage Current" || row.groupLabel === "Temperature Accuracy";
                                        if ((useOxygen || useCentrifuge) && !isSafetyOrTemp) {
                                          return (
                                            <div className="flex items-center gap-1 min-w-[220px] justify-center mx-auto">
                                              <div className="flex flex-col items-center">
                                                <span className="text-[9px] text-slate-400 font-bold mb-0.5">1</span>
                                                <input
                                                  type="text"
                                                  value={row.m1 || ""}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    const avg = calculateAverage(val, row.m2 || "", row.m3 || "");
                                                    handleQuantitativeChangeMultiple(row.originalIndex, { m1: val, avg, measured: avg });
                                                  }}
                                                  placeholder="-"
                                                  className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                                />
                                              </div>
                                              <div className="flex flex-col items-center">
                                                <span className="text-[9px] text-slate-400 font-bold mb-0.5">2</span>
                                                <input
                                                  type="text"
                                                  value={row.m2 || ""}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    const avg = calculateAverage(row.m1 || "", val, row.m3 || "");
                                                    handleQuantitativeChangeMultiple(row.originalIndex, { m2: val, avg, measured: avg });
                                                  }}
                                                  placeholder="-"
                                                  className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                                />
                                              </div>
                                              <div className="flex flex-col items-center">
                                                <span className="text-[9px] text-slate-400 font-bold mb-0.5">3</span>
                                                <input
                                                  type="text"
                                                  value={row.m3 || ""}
                                                  onChange={(e) => {
                                                    const val = e.target.value;
                                                    const avg = calculateAverage(row.m1 || "", row.m2 || "", val);
                                                    handleQuantitativeChangeMultiple(row.originalIndex, { m3: val, avg, measured: avg });
                                                  }}
                                                  placeholder="-"
                                                  className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                                />
                                              </div>
                                              <div className="flex flex-col items-center ml-1">
                                                <span className="text-[9px] text-slate-600 font-bold mb-0.5">AVG</span>
                                                <input
                                                  type="text"
                                                  value={row.avg || row.measured || ""}
                                                  disabled
                                                  className="w-16 px-1 py-1 border border-slate-200 bg-slate-100 text-slate-700 font-bold rounded text-center text-[10px] font-mono"
                                                />
                                              </div>
                                            </div>
                                          );
                                        }
                                        return (
                                          <input
                                            type="text"
                                            value={row.measured}
                                            onChange={(e) => handleQuantitativeChange(row.originalIndex, "measured", e.target.value)}
                                            placeholder="..."
                                            className="w-full px-1.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400 text-[11px] font-mono text-center bg-white"
                                          />
                                        );
                                      })()}
                                    </td>

                                    {/* Evaluation radios PASS, FAIL, N/A */}
                                    <td className="p-1.5 text-center border-r border-slate-150 w-[6%]">
                                      <input
                                        type="radio"
                                        name={`quant-result-${row.originalIndex}`}
                                        checked={row.result === "PASS"}
                                        onChange={() => handleQuantitativeResult(row.originalIndex, "PASS")}
                                        className="w-3.5 h-3.5 border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                      />
                                      <span className="text-[9px] font-bold text-slate-500 ml-1">P</span>
                                    </td>
                                    <td className="p-1.5 text-center border-r border-slate-150 w-[6%]">
                                      <input
                                        type="radio"
                                        name={`quant-result-${row.originalIndex}`}
                                        checked={row.result === "FAIL"}
                                        onChange={() => handleQuantitativeResult(row.originalIndex, "FAIL")}
                                        className="w-3.5 h-3.5 border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                      />
                                      <span className="text-[9px] font-bold text-slate-500 ml-1">F</span>
                                    </td>
                                    <td className="p-1.5 text-center border-r border-slate-150 w-[6%]">
                                      <input
                                        type="radio"
                                        name={`quant-result-${row.originalIndex}`}
                                        checked={row.result === "N/A"}
                                        onChange={() => handleQuantitativeResult(row.originalIndex, "N/A")}
                                        className="w-3.5 h-3.5 border-slate-300 text-slate-400 focus:ring-slate-400 cursor-pointer"
                                      />
                                      <span className="text-[9px] font-bold text-slate-400 ml-1">N/A</span>
                                    </td>

                                    {/* Row deletion button */}
                                    <td className="p-1.5 text-center w-[6%] border-l border-slate-150">
                                      {isFirstOfGroup && totalInGroup > 1 ? (
                                        <button
                                          type="button"
                                          onClick={() => deleteQuantitativeGroup(group.groupLabel)}
                                          className="text-rose-600 font-bold hover:text-rose-700 hover:underline transition-all text-[11px] whitespace-nowrap block mx-auto py-1"
                                          title="ลบทั้งกลุ่มรายการนี้"
                                        >
                                          (ลบกลุ่มนี้)
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => deleteQuantitativeRow(row.originalIndex)}
                                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg h-7 w-7 flex items-center justify-center transition-colors mx-auto"
                                          title="ลบแถวสอบเทียบ"
                                        >
                                          <Trash2 className="h-4 w-4 stroke-[1.8]" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Foot Summary */}
                    <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl flex flex-wrap items-center gap-3 text-xs font-sans font-bold shadow-inner">
                      <span className="text-slate-700">สรุปผล Quantitative :</span>
                      <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-blue-100/40">
                        <span className="bg-blue-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{quantStats.passed}</span> PASS
                      </span>
                      <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-rose-100/40">
                        <span className="bg-rose-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{quantStats.failed}</span> FAIL
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-[11px] shadow-sm border border-slate-200/40">
                        <span className="bg-slate-400 text-white font-mono px-1.5 py-0.2 rounded-full text-[10px]">{quantStats.total - quantStats.passed - quantStats.failed}</span> N/A
                      </span>
                    </div>
                  </div>
                )}

                {/* SUB TAB 4: PREVENTIVE MAINTENANCE & SIGN-OFFS */}
                {activeSubTab === "pm" && (
                  <div className="space-y-5 animate-in fade-in-50 duration-150 flex flex-col">
                    {/* PM task checklist table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1b3a82] flex items-center gap-1.5 uppercase tracking-wider">
                          <Wrench className="h-4 w-4" />
                          Preventive Maintenance (งานบำรุงรักษาเชิงป้องกัน)
                        </h4>
                        <button
                          type="button"
                          onClick={addPmRow}
                          className="px-3 py-1.5 border border-emerald-500 text-emerald-600 bg-white hover:bg-emerald-50/50 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                          + เพิ่มรายการ
                        </button>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead>
                            <tr className="bg-[#1b3a82] text-white font-bold uppercase text-[10px] tracking-wider">
                              <th className="p-2.5 w-[8%] text-center">Done</th>
                              <th className="p-2.5 w-[32%] border-l border-blue-900/40">Task (หัวข้อการบำรุงรักษา)</th>
                              <th className="p-2.5 w-[52%] border-l border-blue-900/40">Comment / Action Done (รายละเอียดการบำรุงรักษา)</th>
                              <th className="p-2.5 w-[8%] text-center border-l border-blue-900/40">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {pmState.map((task, index) => (
                              <tr key={index} className="hover:bg-slate-50/50">
                                <td className="p-2 text-center align-middle">
                                  <input
                                    type="checkbox"
                                    checked={task.done}
                                    onChange={(e) => handlePmChange(index, "done", e.target.checked)}
                                    className="h-4 w-4 border-slate-300 text-emerald-600 rounded-lg focus:ring-emerald-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2 border-l border-slate-100">
                                  <input
                                    type="text"
                                    value={task.taskName}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setPmState((prev) => {
                                        const updated = [...prev];
                                        updated[index] = { ...updated[index], taskName: val };
                                        return updated;
                                      });
                                    }}
                                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 focus:bg-slate-50 p-1 rounded text-[11px]"
                                  />
                                </td>
                                <td className="p-2 border-l border-slate-100">
                                  <input
                                    type="text"
                                    value={task.comment}
                                    onChange={(e) => handlePmChange(index, "comment", e.target.value)}
                                    placeholder="ระบุการทำงานบำรุงรักษาจุดนี้..."
                                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-blue-400 text-[11px]"
                                  />
                                </td>
                                <td className="p-2 border-l border-slate-100 text-center">
                                  <button
                                    type="button"
                                    onClick={() => deletePmRow(index)}
                                    className="p-1.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-500 rounded-xl h-8 w-8 flex items-center justify-center transition-all mx-auto active:scale-95 shadow-sm"
                                    title="ลบรายการบำรุงรักษา"
                                  >
                                    <Trash2 className="h-4 w-4 stroke-[2]" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Remarks/ข้อเสนอแนะ and Dual Sign-offs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Left: Remarks and Defect Symptoms */}
                      <div className="space-y-3.5 flex flex-col justify-start">
                        {/* Defect Symptoms (อาการชำรุด) */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                              กรอกอาการชำรุด / ความบกพร่องที่พบ (Defect Symptoms) <span className="text-rose-500 font-bold">*</span>:
                            </label>
                            {remarksError && (
                              <span className="text-[10px] text-rose-600 font-bold animate-pulse">
                                * จำเป็นต้องกรอกอาการชำรุด
                              </span>
                            )}
                          </div>
                          <textarea
                            id="defect-symptoms-textarea"
                            placeholder="ระบุอาการชำรุด/ผลการทดสอบที่ผิดพลาดด่วน เพื่อส่งต่อฝ่ายซ่อมบำรุงวิเคราะห์ประเมิน (เช่น หน้าจอดับ, พอร์ตชำรุด, กระแสไฟรั่วเกินเกณฑ์)"
                            value={ipmNotesState}
                            onChange={(e) => {
                              setIpmNotesState(e.target.value);
                              if (remarksError) setRemarksError(null);
                            }}
                            className={`w-full min-h-[95px] px-3 py-2.5 text-[11px] rounded-xl outline-none resize-none font-sans leading-relaxed shadow-sm transition-all ${
                              remarksError
                                ? "border-2 border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:bg-white"
                                : "bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-blue-500 focus:bg-white"
                            }`}
                          />
                          {remarksError && (
                            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] rounded-lg font-bold">
                              {remarksError}
                            </div>
                          )}

                          {/* Quick Presets for Defect Symptoms */}
                          <div className="space-y-1 pt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                              คลิกเพื่อเลือกอาการด่วน (Quick Presets):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                "ตรวจพบค่ากระแสไฟฟ้ารั่วบกพร่อง (Electrical Leakage)",
                                "ชิ้นส่วนภายนอกแตกหักเสียหาย / สายสัญญาณชำรุด",
                                "ค่าพารามิเตอร์คลาดเคลื่อนสูงเกินมาตรฐานกำหนด",
                                "หน้าจอแสดงผลดับและปุ่มกดไม่ตอบสนองระบบหลัก",
                                "พบสัญญาณเตือนความบกพร่อง (Alarm Failure)"
                              ].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    setIpmNotesState(preset);
                                    setRemarksError(null);
                                  }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-[9px] font-bold transition-all active:scale-95"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Additional Remarks */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                            Remarks / ข้อเสนอแนะเพิ่มเติม:
                          </label>
                          <textarea
                            id="remarks-textarea"
                            placeholder="กรอกข้อเสนอแนะเพิ่มเติมสำหรับการบันทึกประวัติการบำรุงรักษา หรือการสถิติเชิงลึก (ถ้ามี)..."
                            value={remarksState}
                            onChange={(e) => setRemarksState(e.target.value)}
                            className="w-full min-h-[60px] px-3 py-2 text-[11px] bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none resize-none font-sans leading-relaxed shadow-sm transition-all"
                          />
                        </div>
                      </div>

                      {/* Right: Signatures with Dotted Cards */}
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                          ลงชื่อผู้บันทึกตรวจเช็ค (Clinical Technicians):
                        </label>

                        <div className="grid grid-cols-2 gap-3.5 text-[11px]">
                          {/* Signature Card 1 */}
                          <div className="border border-dashed border-slate-300 bg-slate-50/50 p-3.5 rounded-2xl space-y-3.5 flex flex-col justify-between shadow-sm">
                            <SignaturePad
                              title="Biomedical Engineer"
                              value={biomedSignatureImageState}
                              onChange={setBiomedSignatureImageState}
                            />
                            <div className="space-y-1.5 border-t border-slate-200/60 pt-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px] whitespace-nowrap">ชื่อ Name:</span>
                                <input
                                  type="text"
                                  value={biomedEngineerNameState}
                                  onChange={(e) => setBiomedEngineerNameState(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-800 font-semibold text-[11px] outline-none focus:border-blue-400"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px] whitespace-nowrap">วันที่ Date:</span>
                                <input
                                  type="text"
                                  value={biomedEngineerDateState}
                                  onChange={(e) => setBiomedEngineerDateState(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-800 font-mono text-[11px] outline-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Signature Card 2 */}
                          <div className="border border-dashed border-slate-300 bg-slate-50/50 p-3.5 rounded-2xl space-y-3.5 flex flex-col justify-between shadow-sm">
                            <SignaturePad
                              title="Head of Biomedical"
                              value={headBiomedSignatureImageState}
                              onChange={setHeadBiomedSignatureImageState}
                            />
                            <div className="space-y-1.5 border-t border-slate-200/60 pt-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px] whitespace-nowrap">ชื่อ Name:</span>
                                <input
                                  type="text"
                                  value={headBiomedNameState}
                                  onChange={(e) => setHeadBiomedNameState(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-800 font-semibold text-[11px] outline-none focus:border-blue-400"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-400 text-[10px] whitespace-nowrap">วันที่ Date:</span>
                                <input
                                  type="text"
                                  value={headBiomedDateState}
                                  onChange={(e) => setHeadBiomedDateState(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 text-slate-800 font-mono text-[11px] outline-none focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Warnings and alerts based on evaluations */}
              {activeDevice && (
                (() => {
                  const isPreviouslyRepaired = activeDevice.history?.some(h => h.action === "ซ่อมแซมเสร็จสิ้น" || h.action.includes("ซ่อม")) || activeDevice.repairDetails !== null;
                  return (
                    <div className="space-y-3">
                      {isPreviouslyRepaired && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex gap-2.5 font-sans">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-500 flex-shrink-0 animate-pulse" />
                          <div>
                            <p className="font-bold">เครื่องมือแพทย์นี้เคยผ่านการซ่อมบำรุงรักษาแล้ว (Re-check after Repair)</p>
                            <p className="mt-1 opacity-90">หากทดสอบอีกรอบแล้วยังไม่ผ่านเกณฑ์ ท่านสามารถเลือก <strong>"อนุมัติไม่ผ่านเกณฑ์ (QA REJECT)"</strong> เพื่อปิดเคสส่งรายงานแจ้งชำรุดปลดระวางได้โดยตรง</p>
                          </div>
                        </div>
                      )}
                      {(qualStats.failed > 0 || quantStats.failed > 0) && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex gap-2.5 font-sans">
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
                          <p className="font-semibold leading-relaxed">
                            ตรวจเช็คพบคะแนนไม่ผ่านเกณฑ์ ({qualStats.failed + quantStats.failed} รายการ) ระบบขอแนะนำให้ลงบันทึกในช่อง Remarks และส่งเข้าฝ่ายส่งซ่อม (QA FAIL) เพื่อรักษามาตรฐานความปลอดภัยของผู้ป่วย
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Action Sheet Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-between items-center flex-wrap">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ยกเลิกการเลือก
                </button>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleFail}
                    disabled={!canEdit}
                    id="btn-qa-fail"
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
                      canEdit 
                        ? "bg-rose-600 hover:bg-rose-700 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    }`}
                    title={canEdit ? "" : "เฉพาะฝ่าย IPM เท่านั้นที่ทำรายการได้"}
                  >
                    {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    {canEdit && <ShieldX className="h-4 w-4" />}
                    ไม่ผ่านเกณฑ์ส่งซ่อม (QA FAIL)
                  </button>
                  
                  <button
                    onClick={handleApproveAsFailed}
                    disabled={!canEdit}
                    id="btn-qa-reject"
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
                      canEdit 
                        ? "bg-red-800 hover:bg-red-900 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    }`}
                    title={canEdit ? "" : "เฉพาะฝ่าย IPM เท่านั้นที่ทำรายการได้"}
                  >
                    {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    {canEdit && <XCircle className="h-4 w-4" />}
                    อนุมัติไม่ผ่านเกณฑ์ (QA REJECT)
                  </button>

                  <button
                    onClick={handleSaveDraft}
                    disabled={!canEdit}
                    id="btn-save-draft"
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
                      canEdit 
                        ? "bg-slate-700 hover:bg-slate-800 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    }`}
                    title={canEdit ? "" : "เฉพาะฝ่าย IPM เท่านั้นที่ทำรายการได้"}
                  >
                    {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    {canEdit && <Save className="h-4 w-4" />}
                    บันทึกข้อมูลร่าง (Save Draft)
                  </button>

                  <button
                    onClick={handlePass}
                    disabled={!canEdit}
                    id="btn-qa-pass"
                    className={`px-4 py-2.5 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
                      canEdit 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                    }`}
                    title={canEdit ? "" : "เฉพาะฝ่าย IPM เท่านั้นที่ทำรายการได้"}
                  >
                    {!canEdit && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    {canEdit && <ShieldCheck className="h-4 w-4" />}
                    อนุมัติผ่านเกณฑ์ (QA PASS)
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col justify-center items-center text-center p-12 text-slate-400">
              <ClipboardCheck className="h-16 w-16 mb-4 text-slate-300 animate-pulse" />
              <h3 className="font-bold text-base text-slate-700">ฝ่าย IPM: บันทึกข้อมูลและตรวจเช็ค</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                กรุณาคลิกเลือกเครื่องมือแพทย์จากเมนูรายการรอตรวจด้านซ้าย เพื่อเปิดใบรายงานตรวจสอบคุณภาพไฟฟ้าชีวการแพทย์ และสอบเทียบประสิทธิภาพตามระบบ IPM
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
