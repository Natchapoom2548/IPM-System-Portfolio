/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { saveIpmToGoogleSheet } from "../lib/google-sheets";
import { 
  FileCheck, 
  Award, 
  CheckCircle, 
  XCircle,
  ChevronLeft, ChevronRight, 
  Printer, 
  X,
  FileText,
  Lock,
  Stamp,
  Heart,
  Edit3,
  Save,
  Check,
  Wrench,
  Thermometer,
  CloudRain,
  User,
  Calendar,
  AlertTriangle,
  ClipboardList,
  CheckSquare,
  Clock,
  Layers
} from "lucide-react";
import { MedicalDevice } from "../types";
import { getTodayStrBE } from "../utils/dateUtils";
import { HOSPITALS } from "../data/mockData";
import certificateCrest from "../assets/images/certificate-logo.jpg";

interface ReportingWorkflowProps {
  devices: MedicalDevice[];
  onIssueCertificate: (id: string, certNo: string, approvedBy: string) => void;
  onOpenDeviceDetail: (id: string) => void;
  onUpdateDevice: (updatedDevice: MedicalDevice) => void;
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
  "Control/Switches",
  "Mount/Fasteners",
  "Indicators/Displays",
  "Lid Lock/Interlock",
  "Rotor/Buckets Check",
  "AC Plug",
  "Gaskets/Seals",
  "Line Cord",
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
  { groupLabel: "Ground Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "≤ 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Speed Accuracy (RPM)", controlSetting: "", criteria: "± 5%", setting: "1000", display: "", measured: "", result: "" as any },
  { groupLabel: "Speed Accuracy (RPM)", controlSetting: "", criteria: "± 5%", setting: "2000", display: "", measured: "", result: "" as any },
  { groupLabel: "Speed Accuracy (RPM)", controlSetting: "", criteria: "± 5%", setting: "3000", display: "", measured: "", result: "" as any },
  { groupLabel: "Speed Accuracy (RPM)", controlSetting: "", criteria: "± 5%", setting: "4000", display: "", measured: "", result: "" as any },
  { groupLabel: "Timer Accuracy (sec)", controlSetting: "", criteria: "± 5%", setting: "60", display: "", measured: "", result: "" as any },
  { groupLabel: "Timer Accuracy (sec)", controlSetting: "", criteria: "± 5%", setting: "300", display: "", measured: "", result: "" as any },
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

export const generalQuantitativeList = [
  { groupLabel: "Ground Wire Resistance", controlSetting: "", criteria: "≤ 0.5 Ω", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Chassis Leakage Current", controlSetting: "", criteria: "< 500 µA", setting: "", display: "", measured: "", result: "" as any },
  { groupLabel: "Enclosure Leakage Current", controlSetting: "", criteria: "< 100 µA", setting: "", display: "", measured: "", result: "" as any },
];

const defaultPmList = [
  { taskName: "Clean (ทำความสะอาดภายนอกและภายในเครื่อง)", done: true, comment: "ทำความสะอาดฝุ่นและโครงสร้างภายนอกเรียบร้อย" },
  { taskName: "Lubricate (หล่อลื่นชิ้นส่วนเคลื่อนไหว)", done: true, comment: "หล่อลื่นส่วนลดแรงตึงสายและซีลเรียบร้อย" },
  { taskName: "Filter / Screens Check (ตรวจสอบ/เปลี่ยนแผ่นกรองอากาศ)", done: true, comment: "เป่าทำความสะอาดแผ่นกรองฝุ่น" },
  { taskName: "Battery / Backup System Check (ตรวจสอบสภาพแบตเตอรี่สำรอง)", done: true, comment: "สถานะการเก็บประจุไฟดี" },
  { taskName: "Electrical Safety Check (ตรวจสอบความปลอดภัยทางไฟฟ้าชีวการแพทย์)", done: true, comment: "ทดสอบผ่านเกณฑ์มาตรฐาน" },
  { taskName: "Other / Calibrate (ปรับแต่งเทียบค่ามาตรฐานและส่วนอื่นๆ)", done: true, comment: "ปรับตั้งระบบความเที่ยงตรงสำเร็จ" }
];

export default function ReportingWorkflow({ 
  devices, 
  onIssueCertificate, 
  onOpenDeviceDetail,
  onUpdateDevice,
  userRole = "admin"
}: ReportingWorkflowProps) {
  const canEdit = userRole === "admin" || userRole === "reporting";
  const reportingDevices = devices.filter((d) => d.status === "Reporting");
  const completedDevices = devices.filter((d) => d.status === "Completed");

  const [activeCertificateDevice, setActiveCertificateDevice] = useState<MedicalDevice | null>(null);
  const [approverName, setApproverName] = useState("Sample Approver");
  const [printMode, setPrintMode] = useState<"cert" | "ipm" | "summary" | null>(null);
  const [modalView, setModalView] = useState<"cert" | "ipm">("cert");
  const [certOrientation, setCertOrientation] = useState<"portrait" | "landscape">("portrait");
  const [overrideStatus, setOverrideStatus] = useState<"PASSED" | "SERVICE REQUIRED" | "REMOVE FROM" | null>(null);
  const [returnDevice, setReturnDevice] = useState<MedicalDevice | null>(null);
  const [returnReason, setReturnReason] = useState("ข้อมูลไม่ครบถ้วน / รายละเอียดขาดตกบกพร่อง");
  const [customReturnReason, setCustomReturnReason] = useState("");
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);

  const handleSaveToSheets = async (device: MedicalDevice) => {
    setIsSavingToSheets(true);
    try {
      const url = await saveIpmToGoogleSheet(device);
      alert(`บันทึกข้อมูลไปยัง Google Sheets สำเร็จ!\nเปิดลิงก์:\n${url}`);
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsSavingToSheets(false);
    }
  };

  useEffect(() => {
    if (activeCertificateDevice) {
      const notes = (activeCertificateDevice.ipmNotes || "").toLowerCase();
      const remarks = (activeCertificateDevice.remarks || "").toLowerCase();
      const isRemoveFrom = activeCertificateDevice.ipmCheckResult === "Failed" && (
        notes.includes("remove") || notes.includes("scrap") || notes.includes("discard") || 
        notes.includes("เลิกใช้") || notes.includes("จำหน่าย") || notes.includes("ไม่สามารถซ่อมได้") || 
        notes.includes("ชำรุดหนัก") || remarks.includes("remove") || remarks.includes("เลิกใช้") || 
        remarks.includes("จำหน่าย")
      );
      
      if (activeCertificateDevice.ipmCheckResult === "Passed") {
        setOverrideStatus("PASSED");
      } else if (isRemoveFrom) {
        setOverrideStatus("REMOVE FROM");
      } else if (activeCertificateDevice.ipmCheckResult === "Failed") {
        setOverrideStatus("SERVICE REQUIRED");
      } else {
        setOverrideStatus("PASSED"); // Default fallback
      }
    } else {
      setOverrideStatus(null);
    }
  }, [activeCertificateDevice]);

  const [selectedReportProvince, setSelectedReportProvince] = useState<string>("ทั้งหมด");
  const [selectedReportHosp, setSelectedReportHosp] = useState<string>("");
  const uniqueHospitals = Array.from(
    new Set([
      ...devices.map((d) => d.location).filter(Boolean),
      ...HOSPITALS.map((h) => h.name)
    ])
  ).filter(h => {
    if (selectedReportProvince === "ทั้งหมด") return true;
    const hospObj = HOSPITALS.find(item => item.name === h);
    return hospObj?.province === selectedReportProvince;
  });

  const handlePrintSummary = () => {
    setPrintMode("summary");
    document.body.classList.add(`print-mode-summary`);
    setTimeout(() => {
      window.print();
      document.body.classList.remove(`print-mode-summary`);
    }, 350);
  };

  // IPM Editor State
  const [editingIpmDevice, setEditingIpmDevice] = useState<MedicalDevice | null>(null);

  const handleApprove = (device: MedicalDevice) => {
    const randomCert = `CERT-${device.id}-${new Date().getFullYear() + 543}-${Math.floor(1000 + Math.random() * 9000)}`;
    onIssueCertificate(device.id, randomCert, approverName);
    
    // Auto-open the newly issued certificate
    const updatedDevice: MedicalDevice = {
      ...device,
      status: "Completed",
      certificateNo: randomCert,
      certificateDate: getTodayStrBE(),
      approvedBy: approverName
    };
    setActiveCertificateDevice(updatedDevice);
  };

  const handleReturnToIPM = (device: MedicalDevice) => {
    setReturnDevice(device);
    setReturnReason("ข้อมูลไม่ครบถ้วน / รายละเอียดขาดตกบกพร่อง");
    setCustomReturnReason("");
  };

  const confirmReturnToIPM = () => {
    if (!returnDevice) return;
    const reasonText = returnReason === "อื่นๆ" ? customReturnReason.trim() : returnReason;
    if (!reasonText) return;

    const updatedDevice: MedicalDevice = {
      ...returnDevice,
      status: "IPM",
      history: [
        {
          date: getTodayStrBE(),
          action: "ส่งกลับไปแก้ไข (Returned to IPM)",
          note: `ฝ่ายรายงานผลส่งกลับให้ฝ่าย IPM ตรวจสอบและแก้ไข: ${reasonText}`,
          user: userRole || "admin"
        },
        ...returnDevice.history
      ]
    };
    onUpdateDevice(updatedDevice);
    setReturnDevice(null);
  };


  const sanitizeDeviceForReport = (dev: MedicalDevice): MedicalDevice => {
    const useNIBP = isNIBPDevice(dev.deviceType, dev.name);
    // If it is NOT an NIBP device, but its tasks are NIBP tasks
    if (!useNIBP && dev.quantitativeTasks && dev.quantitativeTasks.length > 0) {
      const hasNIBPTask = dev.quantitativeTasks.some(t => t.groupLabel && t.groupLabel.includes("Static pressure"));
      if (hasNIBPTask) {
        // Restore the checklist defaults for records that predate persisted task data.
        const useVentilator = isVentilatorDevice(dev.deviceType, dev.name);
        const usePatientMonitor = isPatientMonitorDevice(dev.deviceType, dev.name);
        const useAED = isAedDevice(dev.deviceType, dev.name);
        const useDefib = isDefibDevice(dev.deviceType, dev.name);
        const useEcg = isEcgDevice(dev.deviceType, dev.name);
        const useWeight = isWeightDevice(dev.deviceType, dev.name);
        const useCentrifuge = isCentrifugeDevice(dev.deviceType, dev.name);
        const useSyringe = isSyringePumpDevice(dev.deviceType, dev.name);
        const useInfusion = isInfusionPumpDevice(dev.deviceType, dev.name);
        const useOxygen = isOxygenDevice(dev.deviceType, dev.name);
        const useSpO2 = isSpO2Device(dev.deviceType, dev.name);
        const useThermometer = isThermometerDevice(dev.deviceType, dev.name);
        const useSphygmomanometer = isSphygmomanometerDevice(dev.deviceType, dev.name);
        const useFetalMonitor = isFetalMonitorDevice(dev.deviceType, dev.name);

        let selectedQualList = generalQualitativeList;
        let selectedQuantList = generalQuantitativeList;
        if (useAED) {
          selectedQualList = aedQualitativeList;
          selectedQuantList = aedQuantitativeList;
        } else if (useDefib) {
          selectedQualList = defibQualitativeList;
          selectedQuantList = defibQuantitativeList;
        } else if (useEcg) {
          selectedQualList = ecgQualitativeList;
          selectedQuantList = ecgQuantitativeList;
        } else if (useWeight) {
          selectedQualList = weightQualitativeList;
          selectedQuantList = weightQuantitativeList;
        } else if (useSpO2) {
          selectedQualList = spo2QualitativeList;
          selectedQuantList = spo2QuantitativeList;
        } else if (useCentrifuge) {
          selectedQualList = centrifugeQualitativeList;
          selectedQuantList = centrifugeQuantitativeList;
        } else if (useSyringe) {
          selectedQualList = syringeQualitativeList;
          selectedQuantList = syringeQuantitativeList;
        } else if (useInfusion) {
          selectedQualList = infusionQualitativeList;
          selectedQuantList = infusionQuantitativeList;
        } else if (useVentilator) {
          selectedQualList = ventilatorQualitativeList;
          selectedQuantList = ventilatorQuantitativeList;
        } else if (usePatientMonitor) {
          selectedQualList = patientMonitorQualitativeList;
          selectedQuantList = patientMonitorQuantitativeList;
        } else if (useOxygen) {
          selectedQualList = oxygenQualitativeList;
          selectedQuantList = oxygenQuantitativeList;
        } else if (useThermometer) {
          selectedQualList = thermometerQualitativeList;
          selectedQuantList = thermometerQuantitativeList;
        } else if (useSphygmomanometer) {
          selectedQualList = sphygmomanometerQualitativeList;
          selectedQuantList = sphygmomanometerQuantitativeList;
        } else if (useFetalMonitor) {
          selectedQualList = fetalMonitorQualitativeList;
          selectedQuantList = fetalMonitorQuantitativeList;
        }

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
        } else if (useSpO2) {
          defaultApparatus = [
            { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
            { equipment: "NIBP Tester(or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
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

        const defibPmList = [
          { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
          { taskName: "Battery (Replace Every 18 month) (เปลี่ยนแบตเตอรี่ ทุก 18 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" }
        ];
        const oxygenPmList = [
          { taskName: "Clean (ทำความสะอาดภายนอกและภายในเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Fan Filter (Inlet) (ตรวจสอบแผ่นกรองอากาศทางเข้า)", done: true, comment: "ตรวจสอบและทำความสะอาดตัวกรองเรียบร้อย" },
          { taskName: "Hoes/Silicon (ตรวจสอบท่อสายยาง/ซิลิโคน)", done: true, comment: "ตรวจสอบสายยางไม่มีการรั่วซึม" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ไม่มีอะไหล่ชำรุดเสียหาย" },
          { taskName: "Zeolite (ตรวจสอบสารซีโอไลต์กรองออกซิเจน)", done: true, comment: "ซีโอไลต์กรองออกซิเจนทำงานได้ตามปกติ" },
          { taskName: "Battery ( Replace Every 18-24month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "สภาพเก็บไฟของแบตเตอรี่สำรองปกติ" },
          { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
        ];
        const weightPmList = [
          { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
          { taskName: "Battery (Replace every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" },
          { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
        ];
        const sphygmomanometerPmList = [
          { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
          { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
        ];
        const aedPmList = [
          { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
          { taskName: "Battery ( Replace Every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" }
        ];
        const defaultPmList = [
          { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
          { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
          { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
          { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
        ];

        const finalPmTasks = useOxygen ? oxygenPmList : useSphygmomanometer ? sphygmomanometerPmList : useAED ? aedPmList : (useDefib || useEcg) ? defibPmList : (useWeight || useSpO2 || useCentrifuge || useThermometer || useInfusion || useSyringe || useNIBP || usePatientMonitor || useFetalMonitor) ? weightPmList : defaultPmList;

        return {
          ...dev,
          testApparatus: defaultApparatus,
          qualitativeTasks: selectedQualList.map(name => ({ taskName: name, result: "PASS" as any, comment: "" })),
          quantitativeTasks: selectedQuantList,
          pmTasks: finalPmTasks
        };
      }
    }
    return dev;
  };

  const openEditor = (rawDevice: MedicalDevice) => {
    const device = sanitizeDeviceForReport(rawDevice);
    // Populate with defaults if arrays are empty
    const useVentilator = isVentilatorDevice(device.deviceType, device.name);
    const usePatientMonitor = isPatientMonitorDevice(device.deviceType, device.name);
    const useNIBP = isNIBPDevice(device.deviceType, device.name);
    const useAED = isAedDevice(device.deviceType, device.name);
    const useDefib = isDefibDevice(device.deviceType, device.name);
    const useEcg = isEcgDevice(device.deviceType, device.name);
    const useWeight = isWeightDevice(device.deviceType, device.name);
    const useCentrifuge = isCentrifugeDevice(device.deviceType, device.name);
    const useSyringe = isSyringePumpDevice(device.deviceType, device.name);
    const useInfusion = isInfusionPumpDevice(device.deviceType, device.name);
    const useOxygen = isOxygenDevice(device.deviceType, device.name);
    const useSpO2 = isSpO2Device(device.deviceType, device.name);
    const useThermometer = isThermometerDevice(device.deviceType, device.name);
    const useSphygmomanometer = isSphygmomanometerDevice(device.deviceType, device.name);
    const useFetalMonitor = isFetalMonitorDevice(device.deviceType, device.name);

    let selectedQualList = generalQualitativeList;
    let selectedQuantList = generalQuantitativeList;

    if (useAED) {
      selectedQualList = aedQualitativeList;
      selectedQuantList = aedQuantitativeList;
    } else if (useDefib) {
      selectedQualList = defibQualitativeList;
      selectedQuantList = defibQuantitativeList;
    } else if (useEcg) {
      selectedQualList = ecgQualitativeList;
      selectedQuantList = ecgQuantitativeList;
    } else if (useWeight) {
      selectedQualList = weightQualitativeList;
      selectedQuantList = weightQuantitativeList;
    } else if (useSpO2) {
      selectedQualList = spo2QualitativeList;
      selectedQuantList = spo2QuantitativeList;
    } else if (useCentrifuge) {
      selectedQualList = centrifugeQualitativeList;
      selectedQuantList = centrifugeQuantitativeList;
    } else if (useSyringe) {
      selectedQualList = syringeQualitativeList;
      selectedQuantList = syringeQuantitativeList;
    } else if (useInfusion) {
      selectedQualList = infusionQualitativeList;
      selectedQuantList = infusionQuantitativeList;
    } else if (useVentilator) {
      selectedQualList = ventilatorQualitativeList;
      selectedQuantList = ventilatorQuantitativeList;
    } else if (usePatientMonitor) {
      selectedQualList = patientMonitorQualitativeList;
      selectedQuantList = patientMonitorQuantitativeList;
    } else if (useNIBP) {
      selectedQualList = nibpQualitativeList;
      selectedQuantList = nibpQuantitativeList;
    } else if (useOxygen) {
      selectedQualList = oxygenQualitativeList;
      selectedQuantList = oxygenQuantitativeList;
    } else if (useThermometer) {
      selectedQualList = thermometerQualitativeList;
      selectedQuantList = thermometerQuantitativeList;
    } else if (useSphygmomanometer) {
      selectedQualList = sphygmomanometerQualitativeList;
      selectedQuantList = sphygmomanometerQuantitativeList;
    } else if (useFetalMonitor) {
      selectedQualList = fetalMonitorQualitativeList;
      selectedQuantList = fetalMonitorQuantitativeList;
    }

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
    } else if (useSpO2) {
      defaultApparatus = [
        { equipment: "Electrical Safety Analyzer (or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" },
        { equipment: "NIBP Tester(or equivalent)", manufacturer: "", brandModel: "", serialNo: "", certificateNo: "", calDueDate: "" }
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

    const defibPmList = [
      { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
      { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
      { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
      { taskName: "Battery (Replace Every 18 month) (เปลี่ยนแบตเตอรี่ ทุก 18 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" }
    ];

    const oxygenPmList = [
      { taskName: "Clean (ทำความสะอาดภายนอกและภายในเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
      { taskName: "Fan Filter (Inlet) (ตรวจสอบแผ่นกรองอากาศทางเข้า)", done: true, comment: "ตรวจสอบและทำความสะอาดตัวกรองเรียบร้อย" },
      { taskName: "Hoes/Silicon (ตรวจสอบท่อสายยาง/ซิลิโคน)", done: true, comment: "ตรวจสอบสายยางไม่มีการรั่วซึม" },
      { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ไม่มีอะไหล่ชำรุดเสียหาย" },
      { taskName: "Zeolite (ตรวจสอบสารซีโอไลต์กรองออกซิเจน)", done: true, comment: "ซีโอไลต์กรองออกซิเจนทำงานได้ตามปกติ" },
      { taskName: "Battery ( Replace Every 18-24month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "สภาพเก็บไฟของแบตเตอรี่สำรองปกติ" },
      { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
    ];

    const weightPmList = [
      { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
      { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
      { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
      { taskName: "Battery (Replace every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" },
      { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
    ];

    const sphygmomanometerPmList = [
      { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
      { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
      { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
      { taskName: "Other. (งานบำรุงรักษาอื่นๆ)", done: true, comment: "เรียบร้อย" }
    ];

    const aedPmList = [
      { taskName: "Clean (ทำความสะอาดเครื่อง)", done: true, comment: "ทำความสะอาดเรียบร้อย" },
      { taskName: "Lubricate (หล่อลื่นชิ้นส่วน)", done: true, comment: "หล่อลื่นชิ้นส่วนเรียบร้อย" },
      { taskName: "Replace (เปลี่ยนชิ้นส่วนอะไหล่)", done: true, comment: "ตรวจสอบไม่มีชิ้นส่วนต้องเปลี่ยน" },
      { taskName: "Battery ( Replace Every 18-24 month) (เปลี่ยนแบตเตอรี่ ทุก 18-24 เดือน)", done: true, comment: "ตรวจสอบสภาพแบตเตอรี่เรียบร้อย" }
    ];

    const finalPmTasks = useOxygen ? oxygenPmList : useSphygmomanometer ? sphygmomanometerPmList : useAED ? aedPmList : (useDefib || useEcg) ? defibPmList : (useWeight || useSpO2 || useCentrifuge || useThermometer || useInfusion || useSyringe || useNIBP || usePatientMonitor || useFetalMonitor) ? weightPmList : defaultPmList;

    setEditingIpmDevice({
      ...device,
      testApparatus: device.testApparatus && device.testApparatus.length > 0
        ? device.testApparatus
        : defaultApparatus,
      qualitativeTasks: device.qualitativeTasks && device.qualitativeTasks.length > 0
        ? device.qualitativeTasks
        : selectedQualList.map(name => ({ taskName: name, result: "PASS" as any, comment: "" })),
      quantitativeTasks: device.quantitativeTasks && device.quantitativeTasks.length > 0
        ? device.quantitativeTasks
        : selectedQuantList,
      pmTasks: device.pmTasks && device.pmTasks.length > 0
        ? device.pmTasks
        : finalPmTasks,
      temperature: device.temperature || 24.2,
      humidity: device.humidity || 52.5,
      ipmTester: device.ipmTester || "Sample Technician",
      ipmCheckDate: device.ipmCheckDate || getTodayStrBE()
    });
  };

  const saveEditedIpm = () => {
    if (!editingIpmDevice) return;
    onUpdateDevice(editingIpmDevice);
    
    // If the currently open certificate is also the edited device, update it too
    if (activeCertificateDevice && activeCertificateDevice.id === editingIpmDevice.id) {
      setActiveCertificateDevice(editingIpmDevice);
    }
    
    setEditingIpmDevice(null);
  };

  // Helper print handlers
  const triggerPrint = (mode: "cert" | "ipm") => {
    document.body.classList.add(`print-mode-${mode}`);
    setPrintMode(mode);
    setModalView(mode); // Sync active preview tab view
    setTimeout(() => {
      window.focus();
      window.print();
      document.body.classList.remove(`print-mode-${mode}`);
    }, 350);
  };

  return (
    <div className="print:space-y-3 space-y-6" id="reporting-tab">
      {/* Dynamic print styles based on active mode */}
      <style>
        {`
          /* Base print styling resets */
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            tbody.print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            tr.print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }

          /* --- CERTIFICATE PRINT STYLES --- */
          ${printMode === "cert" ? `
            @page {
              size: A4 ${certOrientation} !important;
              margin: 0 !important;
            }
            body.print-mode-cert {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body.print-mode-cert #printable-certificate-paper {
              box-sizing: border-box !important;
              overflow: hidden !important;
              background-color: #fcfbf7 !important;
              width: 100vw !important;
              height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              aspect-ratio: auto !important;
              position: relative !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            body.print-mode-cert #printable-certificate-paper > div {
              padding: 1.5rem !important;
              gap: 0.35rem !important;
              height: 100% !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
            body.print-mode-cert #printable-certificate-paper img {
              width: 3.5rem !important;
              height: 3.5rem !important;
              margin-bottom: 0.15rem !important;
            }
            body.print-mode-cert #printable-certificate-paper h3 {
              font-size: 10px !important;
            }
            body.print-mode-cert #printable-certificate-paper h4 {
              font-size: 1.25rem !important;
              line-height: 1.2 !important;
            }
            body.print-mode-cert #printable-certificate-paper p.italic {
              font-size: 0.8rem !important;
              margin-top: 0.2rem !important;
              margin-bottom: 0.2rem !important;
              line-height: 1.2 !important;
            }
            body.print-mode-cert #printable-certificate-paper p.text-sm.print\\:text-sm {
              font-size: 10px !important;
              line-height: 1.2 !important;
              margin-top: 0.2rem !important;
              margin-bottom: 0.2rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .my-5,
            body.print-mode-cert #printable-certificate-paper .print\\:my-7 {
              margin-top: 0.35rem !important;
              margin-bottom: 0.35rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .w-full.md\\:w-\\[150px\\] {
              width: 140px !important;
            }
            body.print-mode-cert #printable-certificate-paper .w-full.md\\:w-\\[150px\\] > div {
              width: 140px !important;
              height: 85px !important;
              padding: 0.35rem !important;
            }
            body.print-mode-cert #printable-certificate-paper table {
              font-size: 10px !important;
            }
            body.print-mode-cert #printable-certificate-paper td,
            body.print-mode-cert #printable-certificate-paper th {
              padding: 0.25rem 0.35rem !important;
            }
            body.print-mode-cert #printable-certificate-paper h5 {
              font-size: 10px !important;
              padding-bottom: 0.1rem !important;
              margin-bottom: 0.15rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .bg-slate-50.p-3,
            body.print-mode-cert #printable-certificate-paper .bg-\\[\\#fff9f4\\] {
              padding: 0.3rem !important;
              font-size: 9px !important;
              line-height: 1.15 !important;
            }
            body.print-mode-cert #printable-certificate-paper .grid-cols-2 {
              margin-top: auto !important;
              padding-top: 0.4rem !important;
              gap: 1.5rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .grid-cols-2 .h-14 {
              height: 2.2rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .grid-cols-2 p {
              font-size: 9px !important;
              margin-top: 0.1rem !important;
              line-height: 1.1 !important;
            }
            /* Eliminate extra spacing margins */
            body.print-mode-cert #printable-certificate-paper .space-y-2 {
              margin-top: 0.15rem !important;
              margin-bottom: 0.15rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .space-y-2 > :not([hidden]) ~ :not([hidden]) {
              --tw-space-y-reverse: 0 !important;
              margin-top: 0.15rem !important;
              margin-bottom: 0.15rem !important;
            }
            body.print-mode-cert #printable-certificate-paper .border-b.border-slate-200\\/60 {
              padding-bottom: 0.15rem !important;
              margin-bottom: 0.15rem !important;
            }
          ` : ""}

          /* --- IPM REPORT PRINT STYLES --- */
          ${printMode === "ipm" ? `
            body.print-mode-ipm {
              background: white !important;
            }
            body.print-mode-ipm #printable-ipm-report {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* Move Section 3 completely to page 2 */
            body.print-mode-ipm .ipm-section-3 {
              break-before: page !important;
              margin-top: 2rem !important;
            }

            @media print and (orientation: portrait) {
              @page {
                size: A4 portrait !important;
                margin: 1.2cm !important;
              }
            }

            @media print and (orientation: landscape) {
              @page {
                size: A4 landscape !important;
                margin: 0.8cm !important;
              }
              body.print-mode-ipm #printable-ipm-report table {
                font-size: 10px !important;
              }
              body.print-mode-ipm #printable-ipm-report td, 
              body.print-mode-ipm #printable-ipm-report th {
                padding: 0.35rem !important;
              }
            }
          ` : ""}

          /* --- SUMMARY REPORT PRINT STYLES --- */
          ${printMode === "summary" ? `
            body.print-mode-summary {
              background: white !important;
            }
            body.print-mode-summary #printable-summary-report {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            @media print and (orientation: portrait) {
              @page {
                size: A4 portrait !important;
                margin: 1.2cm !important;
              }
            }

            @media print and (orientation: landscape) {
              @page {
                size: A4 landscape !important;
                margin: 0.8cm !important;
              }
              body.print-mode-summary #printable-summary-report table {
                font-size: 10px !important;
              }
              body.print-mode-summary #printable-summary-report td, 
              body.print-mode-summary #printable-summary-report th {
                padding: 0.4rem 0.5rem !important;
              }
            }
          ` : ""}
        `}
      </style>

      {!canEdit && (
        <div className="print:p-2 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-in fade-in duration-150">
          <Lock className="h-5 w-5 text-amber-600 shrink-0" />
          <span>คุณกำลังเข้าชมข้อมูลในโหมดผู้สังเกตการณ์ (View Only) เนื่องจากสิทธิ์การอนุมัติออกใบรับรองและแก้ไขรายงานจำกัดไว้เฉพาะเจ้าหน้าที่ฝ่ายรายงานและผู้ดูแลระบบเท่านั้น</span>
        </div>
      )}

      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-800">
          ฝ่ายรายงานผลและออกใบรับรองประสิทธิภาพ (Medical Compliance &amp; Certification)
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-1">
          การตรวจสอบประวัติอย่างละเอียด, แก้ไขข้อมูล IPM ครบถ้วน, ออกใบรับรองผ่านสติกเกอร์บาร์โค้ด และสั่งพิมพ์เอกสารวิศวกรรมการแพทย์
        </p>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">อยู่ฝ่ายรายงานผล (รอออกใบรับรอง)</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {reportingDevices.length} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ออกใบรับรองสำเร็จ (พร้อมใช้)</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {completedDevices.length} <span className="text-xs font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* รพ.สต. Summary Report section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-3 flex-wrap gap-4 font-sans">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              <Printer className="h-4.5 w-4.5 text-blue-600" />
              รายงานสรุปผลสัมฤทธิ์ราย รพ.สต. (Hospital Performance &amp; Compliance Reports)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">พิมพ์สรุปผลเครื่องที่ผ่านและไม่ผ่านเกณฑ์ของแต่ละ รพ.สต. เพื่อใช้ลงทะเบียนรายงานฝ่ายบริหาร</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap font-sans">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-bold">จังหวัด:</span>
              <select
                value={selectedReportProvince}
                onChange={(e) => {
                  const prov = e.target.value;
                  setSelectedReportProvince(prov);
                  // Auto-reset or keep hospital selection if it belongs to selected province
                  if (prov !== "ทั้งหมด" && selectedReportHosp) {
                    const hospObj = HOSPITALS.find(item => item.name === selectedReportHosp);
                    if (!hospObj || hospObj.province !== prov) {
                      setSelectedReportHosp("");
                    }
                  }
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 cursor-pointer outline-none focus:border-blue-500"
              >
                <option value="ทั้งหมด">ทั้งหมดจังหวัด</option>
                <option value="ตัวอย่างเหนือ">ตัวอย่างเหนือ</option>
                <option value="ตัวอย่างกลาง">ตัวอย่างกลาง</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-bold">รพ.สต.:</span>
              <select
                value={selectedReportHosp}
                onChange={(e) => setSelectedReportHosp(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 cursor-pointer outline-none focus:border-blue-500"
              >
                <option value="">-- เลือก รพ.สต. --</option>
                {uniqueHospitals.map(h => {
                  const hospObj = HOSPITALS.find(item => item.name === h);
                  const provinceSuffix = hospObj ? ` (จ.${hospObj.province})` : "";
                  return (
                    <option key={h} value={h}>
                      {h}{provinceSuffix}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              disabled={!selectedReportHosp}
              onClick={handlePrintSummary}
              className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedReportHosp 
                  ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md active:scale-95" 
                  : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
              }`}
            >
              <Printer className="h-4 w-4" />
              พิมพ์รายงานของ รพ.สต. นี้
            </button>
          </div>
        </div>

        {selectedReportHosp ? (
          (() => {
            const hospDevices = devices.filter(d => d.location === selectedReportHosp);
            const passedCount = hospDevices.filter(d => d.status === "Completed" && d.ipmCheckResult === "Passed").length;
            const failedCount = hospDevices.filter(d => d.ipmCheckResult === "Failed" || d.status === "Repair" || d.history.some(h => h.action.includes("ไม่ผ่าน")));
            const pendingCount = hospDevices.length - passedCount - failedCount.length;

            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 text-xs font-sans">
                {/* Stats cards */}
                <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">เครื่องมือทั้งหมด</p>
                    <p className="text-lg font-black text-slate-800 mt-1">{hospDevices.length} เครื่อง</p>
                  </div>
                  <Layers className="h-5 w-5 text-slate-400" />
                </div>
                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">ผ่านเกณฑ์มาตรฐาน (PASS)</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">{passedCount} เครื่อง</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="bg-rose-50/40 p-3.5 rounded-xl border border-rose-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">ไม่ผ่านเกณฑ์มาตรฐาน (FAIL)</p>
                    <p className="text-lg font-black text-rose-700 mt-1">{failedCount.length} เครื่อง</p>
                  </div>
                  <XCircle className="h-5 w-5 text-rose-500" />
                </div>
                <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">อยู่ระหว่างรอดำเนินการ</p>
                    <p className="text-lg font-black text-amber-700 mt-1">{pendingCount} เครื่อง</p>
                  </div>
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center p-6 text-slate-400 text-xs italic bg-slate-50/60 rounded-xl border border-dashed border-slate-200 font-sans">
            กรุณาเลือก รพ.สต. ด้านบนเพื่อดูสรุปประวัติเครื่องมือและพิมพ์รายงานประเมินผลระดับโรงพยาบาล
          </div>
        )}
      </div>

      {/* Main layout split list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Approval List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-purple-500" />
              รอตรวจสอบเพื่อออกใบรับรอง ({reportingDevices.length} รายการ)
            </h3>
          </div>

          {reportingDevices.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-xl text-center text-slate-400 text-xs">
              ไม่มีเครื่องมือแพทย์ที่ผ่านการทดสอบค้างอยู่ รอคิวการประเมินจากฝ่าย IPM
            </div>
          ) : (
            <div className="space-y-3">
              {reportingDevices.map((device) => (
                <div 
                  key={device.id}
                  className="print:p-2 p-4 border border-purple-100/70 bg-purple-50/10 rounded-xl hover:border-purple-300 transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono font-bold text-[10px] text-purple-600">{device.id}</span>
                      <h4 className="font-bold text-slate-800 text-sm mt-0.5">{device.name}</h4>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                      QA PASSED
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500 font-sans mb-3 space-y-1">
                    <p>รพ.สต.: <strong className="text-slate-700">{device.department}</strong> {device.location && `(${device.location})`}</p>
                    <p>ผู้ตรวจเช็ค: <strong>{device.ipmTester}</strong> เมื่อวันที่ <strong>{device.ipmCheckDate}</strong></p>
                    {device.ipmNotes && <p className="text-emerald-600 line-clamp-1 italic">"{device.ipmNotes}"</p>}
                  </div>

                  {/* Buttons toolbar */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => openEditor(device)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="ตรวจสอบ/แก้ไขผลตรวจ IPM ทั้งหมด"
                    >
                      <Edit3 className="h-3 w-3" />
                      ตรวจสอบ &amp; แก้ไขรายงาน IPM
                    </button>
                    <button
                      onClick={() => onOpenDeviceDetail(device.id)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <ClipboardList className="h-3 w-3" />
                      ดูบันทึกงาน
                    </button>
                  </div>

                  <div className="flex gap-4 items-center justify-between font-sans pt-2 border-t border-slate-100/60 text-xs">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-400 mb-0.5">ผู้ออกใบรับรอง (Clinical Director)</label>
                      <input 
                        type="text" 
                        disabled={!canEdit}
                        value={approverName}
                        onChange={(e) => setApproverName(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-purple-400 text-slate-700 font-semibold text-[11px] disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end">
                      <button
                        onClick={() => handleReturnToIPM(device)}
                        disabled={!canEdit}
                        className={`px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all whitespace-nowrap ${
                          canEdit 
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95 cursor-pointer" 
                            : "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        }`}
                        title={canEdit ? "ส่งกลับให้ฝ่าย IPM แก้ไขรายงาน" : "เฉพาะฝ่ายรายงานเท่านั้นที่ส่งกลับได้"}
                      >
                        {!canEdit && <Lock className="h-3 w-3 text-slate-400" />}
                        <ChevronLeft className="h-3.5 w-3.5" />
                        ส่งกลับฝ่าย IPM
                      </button>
                      <button
                        onClick={() => handleApprove(device)}
                        disabled={!canEdit}
                        id={`btn-approve-cert-${device.id}`}
                        className={`px-3 py-2 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all whitespace-nowrap ${
                          canEdit 
                            ? "bg-purple-600 hover:bg-purple-700 text-white active:scale-95 cursor-pointer" 
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        }`}
                        title={canEdit ? "" : "เฉพาะฝ่ายรายงานเท่านั้นที่ออกใบรับรองได้"}
                      >
                        {!canEdit && <Lock className="h-3 w-3 text-slate-400" />}
                        ออกใบรับรอง
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certified Complied List */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-50 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              ครุภัณฑ์ที่ผ่านการรับรองความปลอดภัยแล้ว ({completedDevices.length} รายการ)
            </h3>
          </div>

          {completedDevices.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-xl text-center text-slate-400 text-xs">
              ยังไม่มีการพิมพ์หรืออนุมัติใบรับรองสำเร็จ คอนเฟิร์มการตรวจเช็คทางซ้ายก่อน
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {completedDevices.map((device) => (
                <div 
                  key={device.id}
                  className="p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 bg-slate-50/30 flex items-center justify-between"
                >
                  <div className="font-sans">
                    <p className="font-mono text-slate-400 text-[10px]">CERT NO: {device.certificateNo?.slice(0, 20)}...</p>
                    <h4 className="font-bold text-slate-800 text-xs mt-0.5">{device.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {device.department} {device.location && `| ${device.location}`}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditor(device)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-blue-50 hover:border-blue-100"
                      title="แก้ไขข้อมูล IPM ของครุภัณฑ์ชิ้นนี้"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setModalView("cert");
                        setActiveCertificateDevice(sanitizeDeviceForReport(device));
                      }}
                      id={`btn-view-cert-${device.id}`}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg border border-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Award className="h-3.5 w-3.5" />
                      เปิดใบรับรอง
                    </button>
                    <button
                      onClick={() => onOpenDeviceDetail(device.id)}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                      title="ดูรายละเอียดการบันทึก"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 1. IPM DATA DETAILED INSPECTION AND EDITOR MODAL */}
      {editingIpmDevice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center print:p-2 p-4 z-50 overflow-y-auto font-sans" id="ipm-editor-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200/80 p-6 relative animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="border-b border-slate-100 pb-3 print:mb-3 mb-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">ตรวจสอบและแก้ไขรายงาน IPM แบบละเอียด</h3>
                  <p className="text-[10px] text-slate-400">แก้ไขข้อมูลความปลอดภัย, การปรับเทียบพารามิเตอร์ และบันทึกทางชีวการแพทย์ได้ทั้งหมด</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingIpmDevice(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto print:space-y-3 space-y-6 pr-2">
              
              {/* SECTION 1: General Specs */}
              <div className="space-y-3 bg-slate-50/50 print:p-2 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  1. ข้อมูลเครื่องมือทั่วไปและสภาพแวดล้อม (General Specifications &amp; Environment)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ชื่อเครื่องมือแพทย์</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.name}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, name: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">รหัสครุภัณฑ์ (Asset No)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.equipmentNo}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, equipmentNo: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">หมายเลขเครื่อง (Serial No)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.serialNumber}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, serialNumber: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-mono font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">รพ.สต. (Department)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.department}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, department: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">สถานที่ไปทำ (Location)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.location || ""}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, location: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                      placeholder="ระบุสถานที่..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ผู้ผลิต (Manufacturer)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.manufacturer}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, manufacturer: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">รุ่น (Model)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.model}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, model: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">อุณหภูมิสิ่งแวดล้อม (°C)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingIpmDevice.temperature}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, temperature: parseFloat(e.target.value) || 24.0})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-semibold text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ความชื้นสัมพัทธ์ (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editingIpmDevice.humidity}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, humidity: parseFloat(e.target.value) || 50.0})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Quantitative Parameters (Calibration table) */}
              <div className="space-y-3 bg-slate-50/50 print:p-2 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  2. รายการวัดพารามิเตอร์และการสอบเทียบค่าทางเทคนิค (Quantitative Parameters &amp; Calibration)
                </h4>
                
                <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse border border-slate-800 text-[11px] font-sans">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-2 border border-slate-800 w-1/4">กลุ่มทดสอบ/หมวดหมู่</th>
                        <th className="p-2 border border-slate-800 w-1/5">พารามิเตอร์ (Parameter)</th>
                        <th className="p-2 border border-slate-800 w-1/6">เกณฑ์มาตรฐาน</th>
                        <th className="p-2 border border-slate-800 w-1/6">ค่าที่วัดได้ (Measured)</th>
                        <th className="p-2 border border-slate-800 w-1/6">ผลประเมิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingIpmDevice.quantitativeTasks?.map((task, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 border border-slate-800 font-medium text-slate-700 whitespace-pre-line">{task.groupLabel}</td>
                          <td className="p-2 border border-slate-800">{task.controlSetting}</td>
                          <td className="p-2 border border-slate-800 font-mono text-slate-500 whitespace-pre-line">{task.criteria}</td>
                          <td className="p-2 border border-slate-800">
                            {(() => {
                              const useOxygen = isOxygenDevice(editingIpmDevice.deviceType, editingIpmDevice.name);
                              const useCentrifuge = isCentrifugeDevice(editingIpmDevice.deviceType, editingIpmDevice.name);
                              const isSafetyOrTemp = task.groupLabel === "Ground Wire Resistance" || task.groupLabel === "Chassis Leakage Current" || task.groupLabel === "Temperature Accuracy";
                              if ((useOxygen || useCentrifuge) && !isSafetyOrTemp) {
                                return (
                                  <div className="flex items-center gap-1 min-w-[220px] justify-center mx-auto">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] text-slate-400 font-bold mb-0.5">1</span>
                                      <input
                                        type="text"
                                        value={task.m1 || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const avg = calculateAverage(val, task.m2 || "", task.m3 || "");
                                          const newTasks = [...(editingIpmDevice.quantitativeTasks || [])];
                                          newTasks[idx] = { ...newTasks[idx], m1: val, avg, measured: avg };
                                          setEditingIpmDevice({...editingIpmDevice, quantitativeTasks: newTasks});
                                        }}
                                        placeholder="-"
                                        className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] text-slate-400 font-bold mb-0.5">2</span>
                                      <input
                                        type="text"
                                        value={task.m2 || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const avg = calculateAverage(task.m1 || "", val, task.m3 || "");
                                          const newTasks = [...(editingIpmDevice.quantitativeTasks || [])];
                                          newTasks[idx] = { ...newTasks[idx], m2: val, avg, measured: avg };
                                          setEditingIpmDevice({...editingIpmDevice, quantitativeTasks: newTasks});
                                        }}
                                        placeholder="-"
                                        className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                      />
                                    </div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] text-slate-400 font-bold mb-0.5">3</span>
                                      <input
                                        type="text"
                                        value={task.m3 || ""}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const avg = calculateAverage(task.m1 || "", task.m2 || "", val);
                                          const newTasks = [...(editingIpmDevice.quantitativeTasks || [])];
                                          newTasks[idx] = { ...newTasks[idx], m3: val, avg, measured: avg };
                                          setEditingIpmDevice({...editingIpmDevice, quantitativeTasks: newTasks});
                                        }}
                                        placeholder="-"
                                        className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-[10px] font-mono bg-white"
                                      />
                                    </div>
                                    <div className="flex flex-col items-center ml-1">
                                      <span className="text-[9px] text-slate-600 font-bold mb-0.5">AVG</span>
                                      <input
                                        type="text"
                                        value={task.avg || task.measured || ""}
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
                                  value={task.measured}
                                  onChange={(e) => {
                                    const newTasks = [...(editingIpmDevice.quantitativeTasks || [])];
                                    newTasks[idx].measured = e.target.value;
                                    setEditingIpmDevice({...editingIpmDevice, quantitativeTasks: newTasks});
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded outline-none focus:border-blue-400 font-mono text-slate-800"
                                />
                              );
                            })()}
                          </td>
                          <td className="p-2 border border-slate-800">
                            <select
                              value={task.result || "PASS"}
                              onChange={(e) => {
                                const newTasks = [...(editingIpmDevice.quantitativeTasks || [])];
                                newTasks[idx].result = e.target.value as any;
                                setEditingIpmDevice({...editingIpmDevice, quantitativeTasks: newTasks});
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-0 outline-none cursor-pointer"
                            >
                              <option value="PASS">PASS</option>
                              <option value="FAIL">FAIL</option>
                              <option value="N/A">N/A</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: Qualitative checks (Chassis etc) */}
              <div className="space-y-3 bg-slate-50/50 print:p-2 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                  3. รายการตรวจสอบเชิงคุณภาพ (Physical &amp; Qualitative integrity check)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 bg-white p-3 rounded-xl border border-slate-200/60">
                  {editingIpmDevice.qualitativeTasks?.map((task, idx) => (
                    <div key={idx} className="flex items-start justify-between p-2 hover:bg-slate-50 rounded-lg border border-slate-50 gap-2">
                      <span className="text-[10px] text-slate-700 flex-1 leading-normal font-sans">{idx + 1}. {task.taskName}</span>
                      <div className="flex gap-1.5 items-center">
                        <select
                          value={task.result || "PASS"}
                          onChange={(e) => {
                            const newTasks = [...(editingIpmDevice.qualitativeTasks || [])];
                            newTasks[idx].result = e.target.value as any;
                            setEditingIpmDevice({...editingIpmDevice, qualitativeTasks: newTasks});
                          }}
                          className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold outline-none cursor-pointer text-slate-700"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <input 
                          type="text"
                          placeholder="หมายเหตุ..."
                          value={task.comment || ""}
                          onChange={(e) => {
                            const newTasks = [...(editingIpmDevice.qualitativeTasks || [])];
                            newTasks[idx].comment = e.target.value;
                            setEditingIpmDevice({...editingIpmDevice, qualitativeTasks: newTasks});
                          }}
                          className="w-24 px-1.5 py-0.5 border border-slate-200 rounded text-[9px] outline-none font-sans"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Preventive Maintenance Tasks (PM) */}
              <div className="space-y-3 bg-slate-50/50 print:p-2 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5 text-emerald-500" />
                  4. รายการบำรุงรักษาเชิงป้องกัน (Preventive Maintenance - PM)
                </h4>
                <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/60">
                  {editingIpmDevice.pmTasks?.map((task, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 p-1.5 hover:bg-slate-50 rounded text-xs">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input 
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            const newPm = [...(editingIpmDevice.pmTasks || [])];
                            newPm[idx].done = e.target.checked;
                            setEditingIpmDevice({...editingIpmDevice, pmTasks: newPm});
                          }}
                          className="rounded text-blue-600 border-slate-800 focus:ring-blue-400 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span className="text-slate-700 font-sans">{task.taskName}</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="คำชี้แจงการบำรุงรักษา..."
                        value={task.comment || ""}
                        onChange={(e) => {
                          const newPm = [...(editingIpmDevice.pmTasks || [])];
                          newPm[idx].comment = e.target.value;
                          setEditingIpmDevice({...editingIpmDevice, pmTasks: newPm});
                        }}
                        className="w-64 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Summary, tester, and results */}
              <div className="space-y-3 bg-slate-50/50 print:p-2 p-4 rounded-2xl border border-slate-100">
                <h4 className="text-xs font-extrabold text-blue-700 flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
                  5. ข้อมูลผู้ตรวจสอบความปลอดภัยและผลประเมิน (Inspection Summary &amp; Tester Info) {!canEdit && <span className="text-amber-600 font-normal">(โหมดผู้สังเกตการณ์ - อ่านเท่านั้น)</span>}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ผู้ตรวจเช็คความปลอดภัย (Tester Name)</label>
                    <input 
                      type="text" 
                      disabled={!canEdit}
                      value={editingIpmDevice.ipmTester || ""}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, ipmTester: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">วันที่ตรวจเช็ค (Check Date)</label>
                    <input 
                      type="text" 
                      disabled={!canEdit}
                      value={editingIpmDevice.ipmCheckDate || ""}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, ipmCheckDate: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">สรุปผลประเมินโดยรวม (IPM Check Result)</label>
                    <select
                      disabled={!canEdit}
                      value={editingIpmDevice.ipmCheckResult || "Passed"}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, ipmCheckResult: e.target.value as any})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 font-bold text-slate-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="Passed">Passed (ผ่านเกณฑ์ความปลอดภัย)</option>
                      <option value="Failed">Failed (ไม่ผ่านเกณฑ์ - ตกหล่น/ต้องการซ่อม)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">รายละเอียดและหมายเหตุความบกพร่อง (Technical Notes / ipmNotes)</label>
                  <textarea 
                    disabled={!canEdit}
                    value={editingIpmDevice.ipmNotes || ""}
                    onChange={(e) => setEditingIpmDevice({...editingIpmDevice, ipmNotes: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 h-20 text-xs font-sans resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="ระบุข้อสังเกตเพิ่มเติม เช่น ระดับกราวด์ดี, มีคราบเล็กน้อยภายนอก..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ลายมือชื่อผู้ทดสอบวิศวกรชีวการแพทย์ (Biomed signature name)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.biomedSignatureName || editingIpmDevice.ipmTester || ""}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, biomedSignatureName: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">ลายมือชื่อผู้อนุมัติผล (Clinical Director signature name)</label>
                    <input 
                      type="text" 
                      value={editingIpmDevice.headBiomedSignatureName || ""}
                      onChange={(e) => setEditingIpmDevice({...editingIpmDevice, headBiomedSignatureName: e.target.value})}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 text-slate-700"
                      placeholder="เช่น Sample Approver"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setEditingIpmDevice(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {canEdit ? "ยกเลิกแก้ไข" : "ปิดหน้าต่าง"}
              </button>
              <button
                onClick={saveEditedIpm}
                disabled={!canEdit}
                className={`px-4 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all ${
                  canEdit 
                    ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer" 
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                }`}
                title={canEdit ? "" : "เฉพาะฝ่ายรายงานเท่านั้นที่บันทึกข้อมูลแก้ไขได้"}
              >
                {canEdit ? <Save className="h-4 w-4" /> : <Lock className="h-4 w-4 text-slate-400" />}
                บันทึกการแก้ไขทั้งหมด
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. DUAL CERTIFICATE AND TECHNICAL IPM REPORT MODAL (PREVIEW & PRINT) */}
      {activeCertificateDevice && typeof document !== "undefined" && createPortal((
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center print:p-2 p-4 z-50 overflow-y-auto font-sans" id="cert-viewer-modal">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 p-6 m-4 relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveCertificateDevice(null)}
              className="absolute toprint:p-2 p-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Interactive Document Preview Tabs */}
            <div className="flex border-b border-slate-100 print:mb-3 mb-4 gap-2 mr-10 flex-shrink-0 font-sans text-xs" id="cert-modal-tabs">
              <button
                onClick={() => setModalView("cert")}
                className={`px-4 py-2 font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${modalView === "cert" ? "border-b-2 border-amber-600 bg-amber-50/20 text-amber-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Award className="h-4 w-4" />
                ใบรับรองสติกเกอร์ (Compliance Certificate)
              </button>
              <button
                onClick={() => setModalView("ipm")}
                className={`px-4 py-2 font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${modalView === "ipm" ? "border-b-2 border-blue-600 bg-blue-50/20 text-blue-800" : "text-slate-400 hover:text-slate-600"}`}
              >
                <ClipboardList className="h-4 w-4" />
                ใบรายงานผลตรวจ IPM (IPM Technical Report)
              </button>
            </div>

            {/* Scrolling container of preview sheets */}
            <div className="flex-1 overflow-y-auto print:p-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl" id="printable-sheets-container">
              
              {/* SHEET A: Formal Certificate (Visible if modalView is cert) */}
              <div 
                className={`flex flex-col print:h-full p-3 print:print:p-2 p-4 bg-[#fcfbf7] relative shadow-xl border-4 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700 bg-rose-50/5" : "border-[#b38e5d]"} rounded-sm formal-thai-document ${modalView === "cert" ? "flex" : "hidden"}`}
                id="printable-certificate-paper"
                style={
                  modalView === "cert" 
                    ? { width: "100%", maxWidth: certOrientation === "landscape" ? "850px" : "600px", aspectRatio: certOrientation === "landscape" ? "297/210" : "210/297", margin: "0 auto" }
                    : undefined
                }
              >
                {/* Elegant Inner Border Line */}
                <div className={`absolute inset-1.5 border-2 border-double ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700/40" : "border-[#b38e5d]/60"} rounded-sm pointer-events-none`} />

                {/* Faint BME Watermark Background */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.035] pointer-events-none select-none z-0">
                  <span className={`text-[130px] md:text-[160px] font-black tracking-[0.15em] ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-800" : "text-[#785935]"} leading-none font-sans`}>BME</span>
                  <span className={`text-[10px] md:text-xs font-bold tracking-[0.3em] ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-800" : "text-[#785935]"} uppercase -mt-2`}>BIOMEDICAL ENGINEERING</span>
                </div>

                {/* Vintage Frame Corner Ornaments */}
                <div className={`absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700" : "border-[#b38e5d]"} rounded-tl-sm pointer-events-none`} />
                <div className={`absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700" : "border-[#b38e5d]"} rounded-tr-sm pointer-events-none`} />
                <div className={`absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700" : "border-[#b38e5d]"} rounded-bl-sm pointer-events-none`} />
                <div className={`absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-700" : "border-[#b38e5d]"} rounded-br-sm pointer-events-none`} />

                {/* Sub-border */}
                <div className="p-6 md:p-10 flex flex-col justify-between flex-1 relative z-10">
                  

                  {/* Header Crest & Directorate Title */}
                  <div className="relative flex flex-col md:flex-row print:flex-row justify-between items-start print-avoid-break">
                    
                    {/* Empty block for center balancing */}
                    <div className="w-[150px] hidden md:block print:block shrink-0"></div>

                    {/* Center Crest */}
                    <div className="flex flex-col items-center text-center flex-1 px-4 print:mb-3 mb-4 md:mb-0 print:mb-0">
                      <img 
                        src={certificateCrest} 
                        alt="Biomedical Engineering Certificate Crest" 
                        className={`w-24 h-24 print:w-20 print:h-20 object-contain mb-3 print:mb-2 rounded-full border-2 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "border-rose-600" : "border-[#b38e5d]"} shadow-sm bg-white`}
                        referrerPolicy="no-referrer"
                      />
                      <h3 className={`text-xs print:text-[10px] font-extrabold uppercase tracking-[0.2em] font-sans ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-800" : "text-[#785935]"}`}>
                        Department of Biomedical Engineering Standards
                      </h3>
                      <p className="text-[10px] print:text-[8px] text-slate-500 font-mono tracking-widest mt-1">
                        MINISTRY OF PUBLIC HEALTH COMPLIANCE COVENANT
                      </p>
                      <div className={`w-48 h-[1.5px] bg-gradient-to-r from-transparent ${activeCertificateDevice.ipmCheckResult === "Failed" ? "via-rose-600/80" : "via-[#b38e5d]/80"} to-transparent mt-3 print:mt-2`} />
                    </div>

                    {/* Floating status summary */}
                    <div className="w-full md:w-[150px] print:w-[150px] flex justify-center md:justify-end print:justify-end shrink-0">
                      <div className="flex flex-col items-center border border-slate-950 p-2 text-slate-950 bg-white w-[150px] h-[95px] z-20 shadow-sm rounded">
                        <span className="text-[10px] print:text-xs font-black tracking-widest text-slate-950 border-b border-slate-950 pb-0.5 mb-1 px-3 block text-center uppercase leading-none">
                          STATUS
                        </span>
                        <div className="space-y-1 text-[9px] print:text-[10px] font-extrabold w-full text-left pl-1">
                          <button
                            type="button"
                            onClick={() => setOverrideStatus("PASSED")}
                            className="flex items-center gap-1.5 w-full text-left hover:bg-slate-50 rounded cursor-pointer"
                          >
                            <div className="h-3 w-3 border border-slate-950 flex items-center justify-center shrink-0">
                              {overrideStatus === "PASSED" && <span className="text-[9px] font-black">&#10003;</span>}
                            </div>
                            <span className={overrideStatus === "PASSED" ? "text-slate-950 font-black" : "text-slate-400"}>PASSED</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverrideStatus("SERVICE REQUIRED")}
                            className="flex items-center gap-1.5 w-full text-left hover:bg-slate-50 rounded cursor-pointer"
                          >
                            <div className="h-3 w-3 border border-slate-950 flex items-center justify-center shrink-0">
                              {overrideStatus === "SERVICE REQUIRED" && <span className="text-[9px] font-black">&#10003;</span>}
                            </div>
                            <span className={overrideStatus === "SERVICE REQUIRED" ? "text-slate-950 font-black" : "text-slate-400"}>SERVICE REQUIRED</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOverrideStatus("REMOVE FROM")}
                            className="flex items-center gap-1.5 w-full text-left hover:bg-slate-50 rounded cursor-pointer"
                          >
                            <div className="h-3 w-3 border border-slate-950 flex items-center justify-center shrink-0">
                              {overrideStatus === "REMOVE FROM" && <span className="text-[9px] font-black">&#10003;</span>}
                            </div>
                            <span className={overrideStatus === "REMOVE FROM" ? "text-slate-950 font-black" : "text-slate-400"}>REMOVE FROM</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center space-y-1.5 print:space-y-1 print-avoid-break">
                    <h4 className={`text-xl md:text-2xl print:text-2xl font-black tracking-tight font-sans ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-700" : "text-slate-900"}`}>
                      {activeCertificateDevice.ipmCheckResult === "Failed" 
                        ? "หนังสือรายงานบันทึกประเมินผลมาตรฐานและความปลอดภัยเครื่องมือแพทย์ (ไม่ผ่านเกณฑ์)" 
                        : "หนังสือสำคัญการรับรองมาตรฐานและความปลอดภัยเครื่องมือแพทย์"
                      }
                    </h4>
                    <p className={`text-xs print:text-xs font-bold uppercase tracking-widest font-mono ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-600" : "text-[#937047]"}`}>
                      {activeCertificateDevice.ipmCheckResult === "Failed"
                        ? "Biomedical Safety Assessment Report (NON-COMPLIANCE)"
                        : "Certificate of Biomedical Compliance & Safety Standards"
                      }
                    </p>
                  </div>

                  {/* Reference No & Date Info Row */}
                  <div className="flex justify-between text-xs print:text-xs text-slate-600 font-mono px-1 print-avoid-break border-b border-slate-200/60 pb-2">
                    <span>
                      {activeCertificateDevice.ipmCheckResult === "Failed" ? "เลขที่รายงานบันทึกผล / REPORT NO: " : "เลขที่หนังสือรับรอง / CERTIFICATE NO: "}
                      <strong className="text-slate-900 font-bold">{activeCertificateDevice.certificateNo}</strong>
                    </span>
                    <span>วันที่ตรวจสอบล่าสุด / DATE OF INSPECTION: <strong className="text-slate-900 font-bold">{activeCertificateDevice.certificateDate || getTodayStrBE()}</strong></span>
                  </div>

                  {/* Certification Declaration Statement */}
                  <p className="text-sm print:text-sm text-slate-700 leading-relaxed print:leading-relaxed text-center font-sans max-w-2xl mx-auto italic px-2 print:my-7 my-5 print-avoid-break">
                    {activeCertificateDevice.ipmCheckResult === "Failed"
                      ? `"หนังสือรายงานฉบับนี้ขอระบุบันทึกผลการตรวจสอบว่า ครุภัณฑ์ทางการแพทย์และอุปกรณ์สุขภาพตามรายการรายละเอียดด้านล่างนี้ ได้รับการตรวจเช็คประสิทธิภาพระบบความปลอดภัยแล้ว แต่ผลทดสอบทางเทคนิคไม่เป็นไปตามเกณฑ์มาตรฐานความปลอดภัยทางไฟฟ้าชีวการแพทย์ (Biomedical Safety Standards) จึงไม่สามารถให้การรับรองความพร้อมใช้งานได้ตามปกติ"`
                      : `"หนังสือสำคัญฉบับนี้ขอรับรองว่า ครุภัณฑ์ทางการแพทย์และอุปกรณ์สุขภาพตามรายการรายละเอียดด้านล่างนี้ ได้ผ่านกระบวนการตรวจสอบ บำรุงรักษาเชิงป้องกัน (Preventive Maintenance) และสอบเทียบมาตรฐานความถูกต้องเพื่อความปลอดภัยทางไฟฟ้าชีวการแพทย์ (Biomedical Electrical Safety Analyzed) ภายใต้เกณฑ์มาตรฐานระบบสากลเป็นที่เสร็จสมบูรณ์เรียบร้อยแล้ว"`
                    }
                  </p>

                  {/* Asset Specifications Grid Table */}
                  <div className="border border-slate-800 rounded-xl  shadow-sm bg-white">
                    <table className="w-full text-xs print:text-xs border-collapse font-sans">
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="w-1/4 p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">ชื่อครุภัณฑ์ (Asset Name)</td>
                          <td className="w-1/4 p-3 print:p-2.5 border-r border-slate-200 font-bold text-slate-900">{activeCertificateDevice.name}</td>
                          <td className="w-1/4 p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">รหัสครุภัณฑ์ (Asset ID)</td>
                          <td className="w-1/4 p-3 print:p-2.5 font-mono font-bold text-slate-900">{activeCertificateDevice.equipmentNo}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">หมายเลขเครื่อง (Serial No)</td>
                          <td className="p-3 print:p-2.5 border-r border-slate-200 font-mono font-semibold text-slate-900">{activeCertificateDevice.serialNumber || "N/A"}</td>
                          <td className="p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">ผู้ผลิต / รุ่น (Brand / Model)</td>
                          <td className="p-3 print:p-2.5 text-slate-900 font-medium">{activeCertificateDevice.manufacturer} - {activeCertificateDevice.model}</td>
                        </tr>
                        <tr>
                          <td className="p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">หน่วยงานเจ้าของ (Department)</td>
                          <td className="p-3 print:p-2.5 border-r border-slate-200 text-slate-900 font-medium">{activeCertificateDevice.department} {activeCertificateDevice.location && `(${activeCertificateDevice.location})`}</td>
                          <td className="p-3 print:p-2.5 bg-slate-50 font-bold border-r border-slate-200 text-slate-600">รอบการประเมินมาตรฐาน (IPM Round)</td>
                          <td className="p-3 print:p-2.5 font-semibold text-slate-900">{activeCertificateDevice.ipmRound}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Calibration & Electrical Safety Technical Results Table */}
                  <div className="space-y-2">
                    <h5 className={`text-xs print:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-700" : "text-[#937047]"}`}>
                      <CheckCircle className={`h-3.5 w-3.5 ${activeCertificateDevice.ipmCheckResult === "Failed" ? "text-rose-600" : "text-[#b38e5d]"}`} />
                      บันทึกวิเคราะห์ผลการประเมินทางวิศวกรรมการแพทย์ (Clinical Engineering Safety Summary)
                    </h5>
                    
                    <table className="w-full text-xs print:text-xs border border-slate-200/80 rounded-lg  font-sans">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <th className="p-2 border border-slate-800.5 print:p-2 text-left pl-3 print:pl-2">หัวข้อการตรวจสอบ (Inspection Criteria)</th>
                          <th className="p-2 border border-slate-800.5 print:p-2 text-center">เกณฑ์มาตรฐาน (Reference Range)</th>
                          <th className="p-2 border border-slate-800.5 print:p-2 text-center">ค่าตรวจวัดที่แท้จริง (Actual Measured)</th>
                          <th className="p-2 border border-slate-800.5 print:p-2 text-center">สรุปผลประเมิน (Evaluation Status)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {activeCertificateDevice.quantitativeTasks ? (
                          activeCertificateDevice.quantitativeTasks.slice(0, 4).map((task, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/20">
                              <td className="p-2 border border-slate-800.5 print:p-2 pl-3 print:pl-2 font-medium text-slate-700 whitespace-pre-line">{task.groupLabel || task.controlSetting}</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono text-slate-500 whitespace-pre-line">{task.criteria}</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono font-bold text-slate-800">
                                {(() => {
                                  const useOxygen = isOxygenDevice(activeCertificateDevice.deviceType, activeCertificateDevice.name);
                                  const useCentrifuge = isCentrifugeDevice(activeCertificateDevice.deviceType, activeCertificateDevice.name);
                                  const isSafetyOrTemp = task.groupLabel === "Ground Wire Resistance" || task.groupLabel === "Chassis Leakage Current" || task.groupLabel === "Temperature Accuracy";
                                  if ((useOxygen || useCentrifuge) && !isSafetyOrTemp) {
                                    return (
                                      <div className="flex flex-col items-center justify-center text-[10px] space-y-0.5">
                                        <div className="flex items-center gap-1.5 text-[9px] text-slate-500 justify-center">
                                          <span>T1: <strong className="text-slate-800 font-mono font-bold">{task.m1 || "-"}</strong></span>
                                          <span>T2: <strong className="text-slate-800 font-mono font-bold">{task.m2 || "-"}</strong></span>
                                          <span>T3: <strong className="text-slate-800 font-mono font-bold">{task.m3 || "-"}</strong></span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-900 border-t border-slate-150 w-full text-center pt-0.5 mt-0.5">
                                          Avg: {task.measured || task.avg || "-"}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return <span>{task.measured}</span>;
                                })()}
                              </td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center">
                                {task.result === "FAIL" || activeCertificateDevice.ipmCheckResult === "Failed" ? (
                                  <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] print:text-[10px] border border-rose-200/70">
                                    ไม่ผ่านเกณฑ์ (FAIL)
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] print:text-[10px] border border-emerald-200/70">
                                    ผ่านเกณฑ์ (PASS)
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <>
                            <tr className="hover:bg-slate-50/20">
                              <td className="p-2 border border-slate-800.5 print:p-2 pl-3 print:pl-2 font-medium text-slate-700">Grounding Resistance (ความต้านทานดินป้องกัน)</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono text-slate-500">&lt; 0.3 &Omega;</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono font-bold text-slate-800">
                                {activeCertificateDevice.ipmCheckResult === "Failed" ? "1.25 \u03a9" : "0.12 \u03a9"}
                              </td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center">
                                {activeCertificateDevice.ipmCheckResult === "Failed" ? (
                                  <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] print:text-[10px] border border-rose-200/70">
                                    ไม่ผ่านเกณฑ์ (FAIL)
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] print:text-[10px] border border-emerald-200/70">
                                    ผ่านเกณฑ์ (PASS)
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/20">
                              <td className="p-2 border border-slate-800.5 print:p-2 pl-3 print:pl-2 font-medium text-slate-700">Chassis Leakage Current (กระแสรั่วไหลที่โครงเครื่อง)</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono text-slate-500">&lt; 500 &micro;A</td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center font-mono font-bold text-slate-800">
                                {activeCertificateDevice.ipmCheckResult === "Failed" ? "582 \u03bcA" : "45 \u03bcA"}
                              </td>
                              <td className="p-2 border border-slate-800.5 print:p-2 text-center">
                                {activeCertificateDevice.ipmCheckResult === "Failed" ? (
                                  <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[10px] print:text-[10px] border border-rose-200/70">
                                    ไม่ผ่านเกณฑ์ (FAIL)
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] print:text-[10px] border border-emerald-200/70">
                                    ผ่านเกณฑ์ (PASS)
                                  </span>
                                )}
                              </td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* IPM Specialist Technical Notes */}
                  {activeCertificateDevice.ipmNotes && (
                    <div className="bg-slate-50 p-3 print:p-2.5 rounded-lg border border-slate-150 text-xs print:text-xs font-sans text-slate-600">
                      <span className="font-bold text-slate-700 block mb-1">ความคิดเห็นและบันทึกทางเทคนิคเพิ่มเติม (Specialist Notes):</span>
                      <p className="italic">"{activeCertificateDevice.ipmNotes}"</p>
                    </div>
                  )}

                  {/* Associated Repair History Record */}
                  {activeCertificateDevice.repairDetails ? (
                    <div className="bg-[#fff9f4] p-3 print:p-2.5 rounded-lg border border-[#e6b9a8]/50 text-xs print:text-xs font-sans">
                      <p className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                        <Wrench className="h-3.5 w-3.5 text-rose-600" />
                        ประวัติงานบริการและซ่อมบำรุงวิศวกรรมการแพทย์ (Biomedical Maintenance Record)
                      </p>
                      <p className="text-slate-600 pl-5 bg-white p-1.5 rounded border border-slate-100 italic leading-relaxed text-xs print:text-xs">
                        {activeCertificateDevice.repairDetails}
                      </p>
                      {activeCertificateDevice.repairTechnician && (
                        <p className="text-[10px] print:text-[10px] text-slate-400 mt-1 pl-5">
                          วิศวกรและผู้เชี่ยวชาญดำเนินการตรวจซ่อมแซม: <strong>{activeCertificateDevice.repairTechnician}</strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50/50 p-2 print:p-1.5 text-[10px] print:text-[10px] text-slate-400 text-center italic rounded border border-slate-100">
                      * ไม่พบรายการชำรุดหรือส่งซ่อมบำรุงพิเศษสำหรับครุภัณฑ์ชิ้นนี้ในรอบการประเมินมาตรฐานปัจจุบัน *
                    </div>
                  )}

                  {/* Double Signature Columns */}
                  <div className="grid grid-cols-2 gap-8 print:gap-4 text-center text-xs print:text-xs font-sans mt-auto print:pt-3 pt-6 print:pt-4 border-t border-slate-200 print-avoid-break">
                    <div className="space-y-1 print:space-y-1 flex flex-col items-center">
                      <div className="h-14 print:h-12 w-full flex items-center justify-center border-b border-dashed border-slate-800 relative">
                        {activeCertificateDevice.biomedSignatureImage ? (
                          <img src={activeCertificateDevice.biomedSignatureImage} alt="Sig" className="max-h-full max-w-[120px] object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="italic text-[#937047] font-serif font-bold text-sm print:text-xs">{activeCertificateDevice.ipmTester || "Sample Technician"}</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800 mt-1 print:mt-0.5">{activeCertificateDevice.biomedSignatureName || activeCertificateDevice.ipmTester || "Sample Technician"}</p>
                      <p className="text-[9.5px] print:text-[8px] text-slate-400 font-mono">วิศวกรทดสอบและสอบเทียบมาตรฐาน (Biomedical Calibration Engineer)</p>
                    </div>

                    <div className="space-y-1 print:space-y-1 flex flex-col items-center">
                      <div className="h-14 print:h-12 w-full flex items-center justify-center border-b border-dashed border-slate-800 relative">
                        {activeCertificateDevice.headBiomedSignatureImage ? (
                          <img src={activeCertificateDevice.headBiomedSignatureImage} alt="Sig" className="max-h-full max-w-[120px] object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="italic text-[#937047] font-serif font-bold text-sm print:text-xs">{activeCertificateDevice.headBiomedSignatureName || "Sample Approver"}</span>
                        )}
                      </div>
                      <p className="font-bold text-slate-800 mt-1 print:mt-0.5">{activeCertificateDevice.headBiomedSignatureName || "Sample Approver"}</p>
                      <p className="text-[9.5px] print:text-[8px] text-slate-400 font-mono">ผู้อำนวยการส่วนวิศวกรรมและการทดสอบ (Director of Biomedical Directorate)</p>
                    </div>
                  </div>

                </div>
              </div>

                            {/* SHEET B: Formal Technical IPM Report (Visible if modalView is ipm) */}
              <div 
                className={`p-6 print:p-0 bg-white relative text-black text-[10px] font-sans ${modalView === "ipm" ? "block" : "hidden"}`}
                id="printable-ipm-report"
                style={
                  modalView === "ipm" 
                    ? { width: "100%", maxWidth: "850px", margin: "0 auto", padding: "20px" }
                    : undefined
                }
              >
                {/* Custom print CSS for this specific report */}
                <style>
                  {`
                    @media print {
                      @page {
                        size: A4 portrait;
                        margin: 0.5cm;
                      }
                      body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      #printable-ipm-report table {
                        width: 100%;
                        border-collapse: collapse;
                      }
                      #printable-ipm-report th, #printable-ipm-report td {
                        border: 1px solid #000;
                        padding: 2px 4px;
                      }
                      .bg-blue-header {
                        background-color: #0000FF !important;
                        color: white !important;
                        font-weight: bold;
                        text-align: center;
                      }
                      .bg-gray-cell {
                        background-color: #D1D5DB !important;
                      }
                    }
                  `}
                </style>

                {/* HEADER */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <img src={certificateCrest} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-lg font-bold">Inspection and Preventive Maintenance System Of {activeCertificateDevice.deviceType || "Medical Equipment"}</h1>
                      <h2 className="text-[10px] font-bold text-gray-700">ระบบตัวอย่างบริหารเครื่องมือแพทย์ BIOMEDICAL ENGINEERING</h2>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start mb-2">
                  {/* Dynamic Procedure No */}
                  <div className="font-bold">
                    Procedure No.
                    {(() => {
                      const typeStr = (activeCertificateDevice.deviceType || "").toLowerCase();
                      const nameStr = (activeCertificateDevice.name || "").toLowerCase();
                      if (typeStr.includes("defib") || nameStr.includes("defib")) return "IPM-DEFIB-001 (Period 1 Yr.)";
                      if (typeStr.includes("ecg") || typeStr.includes("ekg") || nameStr.includes("ecg")) return "IPM-ECG-001 (Period 1 Yr.)";
                      if (typeStr.includes("weight") || nameStr.includes("weight")) return "IPM-WEIGHT-001 (Period 1 Yr.)";
                      if (typeStr.includes("spo2") || nameStr.includes("spo2") || nameStr.includes("oximeter")) return "IPM-SPO2-001 (Period 1 Yr.)";
                      if (typeStr.includes("centrifuge") || nameStr.includes("centrifuge")) return "IPM-CENT-001 (Period 1 Yr.)";
                      if (typeStr.includes("syringe") || nameStr.includes("syringe")) return "IPM-SYR-001 (Period 1 Yr.)";
                      if (typeStr.includes("infusion") || nameStr.includes("infusion")) return "IPM-INF-001 (Period 1 Yr.)";
                      if (typeStr.includes("ventilator") || nameStr.includes("ventilator")) return "IPM-VENT-001 (Period 1 Yr.)";
                      if (typeStr.includes("monitor") || nameStr.includes("monitor")) return "IPM-MON-001 (Period 1 Yr.)";
                      if (typeStr.includes("oxygen") || nameStr.includes("oxygen")) return "IPM-OXY-001 (Period 1 Yr.)";
                      if (typeStr.includes("thermo") || nameStr.includes("thermo")) return "IPM-THERM-001 (Period 1 Yr.)";
                      if (typeStr.includes("sphygmo") || nameStr.includes("sphygmo")) return "IPM-SPHYG-001 (Period 1 Yr.)";
                      if (typeStr.includes("fetal") || nameStr.includes("fetal")) return "IPM-FETAL-001 (Period 1 Yr.)";
                      if (typeStr.includes("aed") || nameStr.includes("aed")) return "IPM-AED-001 (Period 1 Yr.)";
                      if (typeStr.includes("nibp") || nameStr.includes("blood pressure") || nameStr.includes("bp") || typeStr.includes("ความดัน")) return "IPM-NIBPMO-001 (Period 1 Yr.)";
                      return "IPM-GEN-001 (Period 1 Yr.)";
                    })()}
                  </div>
                  {/* STATUS BOX */}
                  <div className="border border-black p-2 w-48 text-[10px]">
                    <div className="text-center font-bold underline mb-1">STATUS</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-black flex items-center justify-center">
                          {overrideStatus === "PASSED" || (!overrideStatus && activeCertificateDevice.ipmCheckResult === "Passed") ? "✓" : " "}
                        </div>
                        <span>PASSED</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-black flex items-center justify-center">
                          {overrideStatus === "SERVICE REQUIRED" || (!overrideStatus && activeCertificateDevice.ipmCheckResult === "Failed") ? "✓" : " "}
                        </div>
                        <span>SERVICE REQUIRED</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-black flex items-center justify-center">
                          {overrideStatus === "REMOVE FROM" ? "✓" : " "}
                        </div>
                        <span>REMOVE FROM USE</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment information */}
                <div className="mb-2">
                  <h3 className="font-bold underline text-sm mb-1">Equipment information</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                    <div className="flex items-center"><span className="w-24">Department :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.department}</span></div>
                    <div className="flex items-center"><span className="w-20">ID Code :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.id}</span></div>
                    <div className="flex items-center"><span className="w-24">Equipment No. :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.equipmentNo || "-"}</span></div>
                    <div className="flex items-center"><span className="w-20">IPM Round :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.ipmRound || "-"}</span></div>
                    <div className="flex items-center"><span className="w-24">IPM Date :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.ipmDate || "-"}</span></div>
                    <div className="flex items-center"><span className="w-20">IPM Due Date :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.ipmDueDate || "-"}</span></div>
                    <div className="flex items-center"><span className="w-24">Manufacturer :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.manufacturer || "-"}</span></div>
                    <div className="flex items-center"><span className="w-20">Model :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.model || "-"}</span></div>
                    <div className="flex items-center"><span className="w-24">SN :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.serialNumber || "-"}</span></div>
                    <div className="flex items-center col-span-1 grid grid-cols-2 gap-2">
                      <div className="flex items-center"><span className="w-16">Location :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.location || "-"}</span></div>
                      <div className="flex items-center"><span className="w-20">IPM Report :</span> <span className="border-b border-dotted border-black flex-1 border-b-2 font-mono text-center">{activeCertificateDevice.ipmReport || "-"}</span></div>
                    </div>
                  </div>
                </div>

                {/* IPM Information */}
                <div className="mb-2">
                  <h3 className="font-bold underline text-sm mb-1">IPM Information</h3>
                  <div className="flex items-center gap-2 mb-1 flex-wrap text-[10px]">
                    <span className="font-bold mr-2">IPM Type :</span>
                    {["IPM Planning", "Re-IPM", "New Equipment", "Post Repair", "IPM Miss Planning", "Other"].map(type => {
                      const isChecked = activeCertificateDevice.ipmTypes?.includes(type);
                      return (
                        <div key={type} className="flex items-center gap-1 mr-2">
                          <div className="w-3 h-3 border border-black flex items-center justify-center">{isChecked ? "✓" : " "}</div>
                          <span>{type}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-bold">IPM Environment :</span>
                    <span>Ambient Temperature:</span>
                    <span className="border-b border-dotted border-black w-24 text-center border-b-2">{activeCertificateDevice.temperature || ""}</span>
                    <span>Humidity :</span>
                    <span className="border-b border-dotted border-black w-24 text-center border-b-2">{activeCertificateDevice.humidity || ""}</span>
                  </div>
                </div>

                {/* Test Apparatus */}
                <div className="mb-2">
                  <h3 className="font-bold text-sm mb-1">Test Apparatus:</h3>
                  <table className="w-full border-collapse border border-black text-center text-[10px]" style={{ border: "1px solid black" }}>
                    <thead>
                      <tr>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black" style={{ backgroundColor: "#0000FF", color: "white" }}>Equipment</th>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black" style={{ backgroundColor: "#0000FF", color: "white" }}>Brand / Model</th>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black" style={{ backgroundColor: "#0000FF", color: "white" }}>Serial No.</th>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black" style={{ backgroundColor: "#0000FF", color: "white" }}>Certificate No</th>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black" style={{ backgroundColor: "#0000FF", color: "white" }}>Cal. Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeCertificateDevice.testApparatus || []).map((apparatus, i) => (
                        <tr key={i}>
                          <td className="border border-black p-1 text-left">{apparatus.equipment}</td>
                          <td className="border border-black p-1">{apparatus.brandModel}</td>
                          <td className="border border-black p-1">{apparatus.serialNo}</td>
                          <td className="border border-black p-1">{apparatus.certificateNo}</td>
                          <td className="border border-black p-1">{apparatus.calDueDate}</td>
                        </tr>
                      ))}
                      {/* Empty row fallback if none */}
                      {!(activeCertificateDevice.testApparatus?.length > 0) && (
                        <tr>
                          <td className="border border-black p-1 text-left">&nbsp;</td>
                          <td className="border border-black p-1">&nbsp;</td>
                          <td className="border border-black p-1">&nbsp;</td>
                          <td className="border border-black p-1">&nbsp;</td>
                          <td className="border border-black p-1">&nbsp;</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Qualitative Tasks */}
                <div className="mb-2">
                  <h3 className="font-bold text-sm mb-1">IPM Result:</h3>
                  <table className="w-full border-collapse border border-black text-center text-[9px]" style={{ border: "1px solid black" }}>
                    <thead>
                      <tr>
                        <th colSpan={10} className="bg-blue-600 text-white font-bold p-1 border border-black uppercase tracking-widest" style={{ backgroundColor: "#0000FF", color: "white" }}>QUALITATIVE TASKS</th>
                      </tr>
                      <tr className="font-bold">
                        <td className="border border-black p-1 w-6">PASS</td>
                        <td className="border border-black p-1 w-6">FAIL</td>
                        <td className="border border-black p-1 w-6">N/A</td>
                        <td className="border border-black p-1 text-left">Check</td>
                        <td className="border border-black p-1 w-24">Comment</td>
                        <td className="border border-black p-1 w-6">PASS</td>
                        <td className="border border-black p-1 w-6">FAIL</td>
                        <td className="border border-black p-1 w-6">N/A</td>
                        <td className="border border-black p-1 text-left">Check</td>
                        <td className="border border-black p-1 w-24">Comment</td>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: Math.ceil((activeCertificateDevice.qualitativeTasks?.length || 0) / 2) }).map((_, i) => {
                        const l = activeCertificateDevice.qualitativeTasks?.[i * 2];
                        const r = activeCertificateDevice.qualitativeTasks?.[i * 2 + 1];
                        return (
                          <tr key={i}>
                            <td className="border border-black p-0.5">[{l?.result === "PASS" ? "✓" : " "}]</td>
                            <td className="border border-black p-0.5">[{l?.result === "FAIL" ? "✓" : " "}]</td>
                            <td className="border border-black p-0.5">[{l?.result === "N/A" ? "✓" : " "}]</td>
                            <td className="border border-black p-1 text-left">{l?.taskName || ""}</td>
                            <td className="border border-black p-1 text-left">{l?.comment || ""}</td>
                            <td className="border border-black p-0.5">[{r?.result === "PASS" ? "✓" : " "}]</td>
                            <td className="border border-black p-0.5">[{r?.result === "FAIL" ? "✓" : " "}]</td>
                            <td className="border border-black p-0.5">[{r?.result === "N/A" ? "✓" : " "}]</td>
                            <td className="border border-black p-1 text-left">{r?.taskName || ""}</td>
                            <td className="border border-black p-1 text-left">{r?.comment || ""}</td>
                          </tr>
                        );
                      })}
                      {/* Empty row fallback */}
                      {!(activeCertificateDevice.qualitativeTasks?.length > 0) && (
                        <tr>
                          <td colSpan={10} className="border border-black p-2 text-center text-gray-500">No qualitative tasks recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* QUANTITATIVE TASKS */}
                <div className="mb-2">
                  <table className="w-full border-collapse border border-black text-center text-[9px]" style={{ border: "1px solid black" }}>
                    <thead>
                      <tr>
                        <th colSpan={8} className="bg-blue-600 text-white font-bold p-1 border border-black uppercase tracking-widest" style={{ backgroundColor: "#0000FF", color: "white" }}>QUANTITATIVE TASKS</th>
                      </tr>
                      <tr className="font-bold">
                        <td className="border border-black p-1 text-left" colSpan={2}>Control Setting</td>
                        <td className="border border-black p-1 w-24">Criteria</td>
                        <td className="border border-black p-1 w-24">Set / Indicated</td>
                        <td className="border border-black p-1 w-24">Measured</td>
                        <td className="border border-black p-1 w-8">PASS</td>
                        <td className="border border-black p-1 w-8">FAIL</td>
                        <td className="border border-black p-1 w-8">N/A</td>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const tasks = activeCertificateDevice.quantitativeTasks || [];
                        const groupedRows = [];
                        tasks.forEach((item, index) => {
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
                              <tr key={row.originalIndex}>
                                {isFirstOfGroup && (
                                  <td className="border border-black p-1 text-left w-1/5" rowSpan={totalInGroup}>
                                    {group.groupLabel}
                                  </td>
                                )}
                                <td className="border border-black p-1 text-left w-1/5">
                                  {row.controlSetting || ""}
                                </td>
                                <td className="border border-black p-1 w-24">
                                  {row.criteria || ""}
                                </td>
                                <td className="border border-black p-1 w-24">
                                  {row.setting || ""}
                                </td>
                                <td className="border border-black p-1 w-24">
                                  {row.measured || ""}
                                </td>
                                <td className="border border-black p-1 w-8">
                                  [{row.result === "PASS" ? "✓" : " "}]
                                </td>
                                <td className="border border-black p-1 w-8">
                                  [{row.result === "FAIL" ? "✓" : " "}]
                                </td>
                                <td className="border border-black p-1 w-8">
                                  [{row.result === "N/A" ? "✓" : " "}]
                                </td>
                              </tr>
                            );
                          });
                        });
                      })()}
                      {!(activeCertificateDevice.quantitativeTasks?.length > 0) && (
                        <tr>
                          <td colSpan={8} className="border border-black p-2 text-center text-gray-500">No quantitative tasks recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Wrap PM, NOTE, and Signatures so they stay together on page break if possible */}
                <div className="print-avoid-break">
                {/* PREVENTIVE MAINTENANCE */}
                <div className="mb-2">
                  <table className="w-full border-collapse border border-black text-center text-[10px]" style={{ border: "1px solid black" }}>
                    <thead>
                      <tr>
                        <th colSpan={2} className="bg-blue-600 text-white font-bold p-1 border border-black uppercase tracking-widest" style={{ backgroundColor: "#0000FF", color: "white" }}>PREVENTIVE MAINTENANCE</th>
                      </tr>
                      <tr className="font-bold">
                        <td className="border border-black p-1 w-48 text-left">Done</td>
                        <td className="border border-black p-1">Comment</td>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeCertificateDevice.pmTasks || []).map((task, idx) => {
                        return (
                          <tr key={idx}>
                            <td className="border border-black p-1 text-left">[{task.done ? "✓" : " "}] {task.taskName}</td>
                            <td className="border border-black p-1 text-left">{task.comment || ""}</td>
                          </tr>
                        );
                      })}
                      {!(activeCertificateDevice.pmTasks?.length > 0) && (
                        <tr>
                          <td colSpan={2} className="border border-black p-2 text-center text-gray-500">No PM tasks recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* NOTE */}
                <div className="mb-6">
                  <table className="w-full border-collapse border border-black text-center text-[10px]" style={{ border: "1px solid black" }}>
                    <thead>
                      <tr>
                        <th className="bg-blue-600 text-white font-bold p-1 border border-black uppercase tracking-widest" style={{ backgroundColor: "#0000FF", color: "white" }}>NOTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-2 text-left h-16 align-top">
                          {activeCertificateDevice.ipmNotes || ""}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 text-center text-[10px]">
                  <div className="flex flex-col items-center">
                    <div className="flex items-end mb-1">
                      <span className="mr-2 font-bold">Inspector : </span>
                      <div className="border-b border-dotted border-black w-48 relative h-6 flex justify-center items-end pb-1">
                        {activeCertificateDevice.biomedSignatureImage && (
                          <img src={activeCertificateDevice.biomedSignatureImage} className="absolute bottom-0 h-10 object-contain" referrerPolicy="no-referrer" />
                        )}
                        {!activeCertificateDevice.biomedSignatureImage && activeCertificateDevice.biomedSignatureName && (
                          <span className="italic font-serif">{activeCertificateDevice.biomedSignatureName}</span>
                        )}
                      </div>
                    </div>
                    <span className="ml-16">Biomedical Engineer</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-end mb-1">
                      <span className="mr-2 font-bold">Acceptor : </span>
                      <div className="border-b border-dotted border-black w-48 h-6 relative flex justify-center items-end pb-1">
                        {activeCertificateDevice.headBiomedSignatureImage && (
                          <img src={activeCertificateDevice.headBiomedSignatureImage} className="absolute bottom-0 h-10 object-contain" referrerPolicy="no-referrer" />
                        )}
                        {!activeCertificateDevice.headBiomedSignatureImage && activeCertificateDevice.headBiomedSignatureName && (
                          <span className="italic font-serif">{activeCertificateDevice.headBiomedSignatureName}</span>
                        )}
                      </div>
                    </div>
                    <span className="ml-16">( ........................................................... )</span>
                  </div>
                </div>

                </div>
              </div>
            </div>
{/* Modal Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 flex-shrink-0 font-sans" id="cert-modal-actions">
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setActiveCertificateDevice(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                
                {/* Separate print actions */}
                {modalView === "cert" && (
                  <select
                    value={certOrientation}
                    onChange={(e) => setCertOrientation(e.target.value as any)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold cursor-pointer outline-none focus:border-amber-500"
                  >
                    <option value="portrait">แนวตั้ง (Portrait)</option>
                    <option value="landscape">แนวนอน (Landscape)</option>
                  </select>
                )}
                
                <button
                  onClick={() => triggerPrint("cert")}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  พิมพ์ใบรับรอง (Print Certificate)
                </button>
                
                <button
                  onClick={() => handleSaveToSheets(activeCertificateDevice)}
                  disabled={isSavingToSheets}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSavingToSheets ? "กำลังบันทึก..." : "บันทึกข้อมูลไปยัง Sheets"}
                </button>

                <button
                  onClick={() => triggerPrint("ipm")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  พิมพ์รายงาน IPM (Print IPM Report)
                </button>
              </div>
            </div>
          </div>
        </div>
      ), document.body)}

      {/* ========================================== */}
      {/* PRINTABLE SUMMARY REPORT (รพ.สต.)         */}
      {/* ========================================== */}
      {selectedReportHosp && typeof document !== "undefined" && createPortal((
        <div

          className="hidden" 
          id="printable-summary-report"
        >
          <div className="p-8 bg-white text-black font-sans formal-thai-document print:space-y-3 space-y-6">
            {/* Header section */}
            <div className="flex flex-col items-center text-center space-y-2 border-b-2 border-slate-900 pb-4">
              <img 
                src={certificateCrest} 
                alt="Biomedical Engineering Certificate Crest" 
                className="w-20 h-20 object-contain mb-1 rounded-full border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-xl font-extrabold tracking-tight">
                รายงานสรุปผลสัมฤทธิ์การตรวจสอบความปลอดภัยครุภัณฑ์การแพทย์และอุปกรณ์สุขภาพ
              </h2>
              <p className="text-sm font-bold text-slate-600">
                Hospital Performance &amp; Biomedical Compliance Summary Report
              </p>
              <div className="text-xs space-y-1 font-semibold text-slate-500">
                <p>โรงพยาบาลส่งเสริมสุขภาพตำบล: <span className="text-slate-900 text-sm font-bold">{selectedReportHosp}</span></p>
                <p>วันที่พิมพ์รายงาน: {getTodayStrBE()} | ออกรายงานโดย: ฝ่ายรายงานผลความปลอดภัยทางวิศวกรรมชีวการแพทย์</p>
              </div>
            </div>

            {/* Overview stats table */}
            {(() => {
              const hospDevices = devices.filter(d => d.location === selectedReportHosp);
              const passedDevices = hospDevices.filter(d => d.status === "Completed" && d.ipmCheckResult === "Passed");
              const failedDevices = hospDevices.filter(d => d.ipmCheckResult === "Failed" || d.status === "Repair" || d.history.some(h => h.action.includes("ไม่ผ่าน")));
              const pendingDevices = hospDevices.filter(d => d.status !== "Completed" && d.ipmCheckResult !== "Failed" && d.status !== "Repair" && !d.history.some(h => h.action.includes("ไม่ผ่าน")));

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 border border-slate-800 rounded-lg p-3 bg-slate-50 text-xs">
                    <div className="text-center">
                      <p className="font-bold text-slate-500">เครื่องมือทั้งหมด</p>
                      <p className="text-lg font-black text-slate-900">{hospDevices.length} เครื่อง</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-emerald-600">ผ่านเกณฑ์ (PASS)</p>
                      <p className="text-lg font-black text-emerald-700">{passedDevices.length} เครื่อง</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-rose-600">ไม่ผ่านเกณฑ์ (FAIL)</p>
                      <p className="text-lg font-black text-rose-700">{failedDevices.length} เครื่อง</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-amber-600">รอดำเนินการ</p>
                      <p className="text-lg font-black text-amber-700">{pendingDevices.length} เครื่อง</p>
                    </div>
                  </div>

                  {/* Devices Detailed List Table */}
                  <div className="border border-slate-800 rounded-lg overflow-visible print:overflow-visible print:border-none">
                    <table className="w-full text-left border-collapse border border-slate-800 text-[11px] font-sans print:border print:border-slate-800">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-800 text-slate-700 font-bold">
                          <th className="p-2 border border-slate-800 text-center w-10">ลำดับ</th>
                          <th className="p-2 border border-slate-800 w-28">ID Code / รหัสครุภัณฑ์</th>
                          <th className="p-2 border border-slate-800">ชื่อเครื่องมือแพทย์ / รายการ</th>
                          <th className="p-2 border border-slate-800 w-32">ยี่ห้อ (Manufacturer) / รุ่น (Model)</th>
                          <th className="p-2 border border-slate-800 w-28">หมายเลขเครื่อง (S/N)</th>
                          <th className="p-2 border border-slate-800 text-center w-28">สถานะ QA</th>
                          <th className="p-2 border border-slate-800 w-36">หมายเหตุทางเทคนิค</th>
                        </tr>
                      </thead>
                      {(() => {
                        const mainDevices = hospDevices.length > 3 ? hospDevices.slice(0, hospDevices.length - 3) : [];
                        const bottomDevices = hospDevices.length > 3 ? hospDevices.slice(hospDevices.length - 3) : hospDevices;

                        return hospDevices.length === 0 ? (
                          <tbody>
                            <tr>
                              <td colSpan={7} className="print:p-2 p-4 text-center text-slate-400 italic">ไม่พบประวัติข้อมูลเครื่องมือแพทย์ของ รพ.สต. นี้</td>
                            </tr>
                          </tbody>
                        ) : (
                          <>
                            {mainDevices.length > 0 && (
                              <tbody>
                                {mainDevices.map((d, index) => {
                                  const isPassed = d.status === "Completed" && d.ipmCheckResult === "Passed";
                                  const isFailed = d.ipmCheckResult === "Failed" || d.status === "Repair" || d.history.some(h => h.action.includes("ไม่ผ่าน"));
                                  const isPending = !isPassed && !isFailed;

                                  return (
                                    <tr key={d.id} className="border-b border-slate-200 hover:bg-slate-50/40 text-slate-800">
                                      <td className="p-2 border border-slate-800 text-center text-slate-500 font-mono">{index + 1}</td>
                                      <td className="p-2 border border-slate-800 font-mono font-semibold">{d.id}</td>
                                      <td className="p-2 border border-slate-800 font-bold">{d.name}</td>
                                      <td className="p-2 border border-slate-800 text-slate-600">
                                        {d.manufacturer || "-"} / {d.model || "-"}
                                      </td>
                                      <td className="p-2 border border-slate-800 font-mono text-slate-600">{d.serialNumber || "-"}</td>
                                      <td className="p-2 border border-slate-800 text-center">
                                        {isPassed && (
                                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[9px] border border-emerald-200">
                                            ผ่านเกณฑ์ (PASS)
                                          </span>
                                        )}
                                        {isFailed && (
                                          <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[9px] border border-rose-200">
                                            ไม่ผ่านเกณฑ์ (FAIL)
                                          </span>
                                        )}
                                        {isPending && (
                                          <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[9px] border border-amber-200">
                                            รอดำเนินการ
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-2 border border-slate-800 text-slate-500 text-[10px] leading-tight">
                                        {d.ipmNotes || d.remarks || (isPassed ? "ผ่านการประเมินมาตรฐานความปลอดภัยระดับสูง" : isPending ? "รอดำเนินการทดสอบ" : "-")}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            )}
                            <tbody className="print-avoid-break">
                              {bottomDevices.map((d, index) => {
                                const originalIndex = mainDevices.length + index;
                                const isPassed = d.status === "Completed" && d.ipmCheckResult === "Passed";
                                const isFailed = d.ipmCheckResult === "Failed" || d.status === "Repair" || d.history.some(h => h.action.includes("ไม่ผ่าน"));
                                const isPending = !isPassed && !isFailed;

                                return (
                                  <tr key={d.id} className="border-b border-slate-200 hover:bg-slate-50/40 text-slate-800">
                                    <td className="p-2 border border-slate-800 text-center text-slate-500 font-mono">{originalIndex + 1}</td>
                                    <td className="p-2 border border-slate-800 font-mono font-semibold">{d.id}</td>
                                    <td className="p-2 border border-slate-800 font-bold">{d.name}</td>
                                    <td className="p-2 border border-slate-800 text-slate-600">
                                      {d.manufacturer || "-"} / {d.model || "-"}
                                    </td>
                                    <td className="p-2 border border-slate-800 font-mono text-slate-600">{d.serialNumber || "-"}</td>
                                    <td className="p-2 border border-slate-800 text-center">
                                      {isPassed && (
                                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[9px] border border-emerald-200">
                                          ผ่านเกณฑ์ (PASS)
                                        </span>
                                      )}
                                      {isFailed && (
                                        <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full font-bold text-[9px] border border-rose-200">
                                          ไม่ผ่านเกณฑ์ (FAIL)
                                        </span>
                                      )}
                                      {isPending && (
                                        <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-bold text-[9px] border border-amber-200">
                                          รอดำเนินการ
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-2 border border-slate-800 text-slate-500 text-[10px] leading-tight">
                                      {d.ipmNotes || d.remarks || (isPassed ? "ผ่านการประเมินมาตรฐานความปลอดภัยระดับสูง" : isPending ? "รอดำเนินการทดสอบ" : "-")}
                                    </td>
                                  </tr>
                                );
                              })}
                              {/* Embed signature and footer inside the tbody to avoid page orphan */}
                              <tr className="print-avoid-break" style={{ border: "none" }}>
                                <td colSpan={7} style={{ border: "none" }} className="p-0 border-none">
                                  <div className="pt-8 text-xs font-sans space-y-4">
                                    <p className="text-center italic text-slate-500 leading-relaxed max-w-xl mx-auto">
                                      "รายงานสรุปผลฉบับนี้เป็นข้อมูลประวัติการทดสอบมาตรฐานความปลอดภัยเครื่องมือแพทย์ (IPM) ประจำ รพ.สต. เพื่อใช้เป็นเอกสารประกอบในโครงการยกระดับมาตรฐานความมั่นคงและคุณภาพด้านการบริการผู้ป่วย"
                                    </p>
                                    <div className="grid grid-cols-2 gap-12 text-center pt-8 max-w-xl mx-auto">
                                      <div className="space-y-2 flex flex-col items-center">
                                        <div className="h-14 w-56 flex items-center justify-center border-b border-slate-800 relative">
                                          <span className="italic text-slate-400 font-serif font-bold text-sm">Sample Technician</span>
                                        </div>
                                        <p className="font-bold text-slate-800 mt-1">ผู้ตรวจตัวอย่าง (Sample Technician)</p>
                                        <p className="text-[10px] text-slate-400 font-medium">ผู้ตรวจสอบและสรุปรายงาน (Biomedical Technician)</p>
                                      </div>
                                      <div className="space-y-2 flex flex-col items-center">
                                        <div className="h-14 w-56 flex items-center justify-center border-b border-slate-800 relative">
                                          <span className="italic text-slate-400 font-serif font-bold text-sm">Sample Approver</span>
                                        </div>
                                        <p className="font-bold text-slate-800 mt-1">ผู้อนุมัติตัวอย่าง (Sample Approver)</p>
                                        <p className="text-[10px] text-slate-400 font-medium">ผู้อนุมัติฝ่ายวิศวกรรมการแพทย์ชีวภาพ (Clinical Director)</p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </>
                        );
                      })()}
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ), document.body)}

      {/* Custom Return to IPM Reason Dialog Modal */}
      {returnDevice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">ส่งกลับไปแก้ไขที่ฝ่าย IPM</h3>
                  <p className="text-[10px] text-rose-600 font-semibold">{returnDevice.id} • {returnDevice.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setReturnDevice(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <label className="block text-xs font-bold text-slate-600">กรุณาเลือกหรือระบุเหตุผลเพื่อเป็นข้อมูลให้ฝ่าย IPM แก้ไข:</label>
              
              <div className="space-y-2">
                {[
                  "ข้อมูลไม่ครบถ้วน / รายละเอียดขาดตกบกพร่อง",
                  "ผลการทดสอบค่าเชิงปริมาณผิดปกติ / ไม่เป็นไปตามเกณฑ์",
                  "ขาดเอกสารแนบ / ลายเซ็นไม่ครบถ้วน",
                  "อื่นๆ"
                ].map((reasonOption) => {
                  const isChecked = returnReason === reasonOption;
                  return (
                    <label 
                      key={reasonOption} 
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? "bg-rose-50/50 border-rose-200 text-rose-950 font-bold" 
                          : "bg-white border-slate-100 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <input 
                        type="radio"
                        name="return_reason"
                        checked={isChecked}
                        onChange={() => setReturnReason(reasonOption)}
                        className="mt-0.5 h-4 w-4 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-xs leading-relaxed">{reasonOption}</span>
                    </label>
                  );
                })}
              </div>

              {returnReason === "อื่นๆ" && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">ระบุเหตุผลเพิ่มเติม:</label>
                  <textarea
                    rows={3}
                    placeholder="พิมพ์รายละเอียดของสาเหตุที่ต้องการให้แก้ไข..."
                    value={customReturnReason}
                    onChange={(e) => setCustomReturnReason(e.target.value)}
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none text-slate-700 bg-slate-50/50 placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setReturnDevice(null)}
                className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-100 transition-all font-bold text-xs cursor-pointer active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmReturnToIPM}
                disabled={returnReason === "อื่นๆ" && !customReturnReason.trim()}
                className={`px-4 py-2 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                  returnReason === "อื่นๆ" && !customReturnReason.trim()
                    ? "bg-rose-300 cursor-not-allowed"
                    : "bg-rose-600 hover:bg-rose-700 cursor-pointer"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                ยืนยันส่งกลับไปแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
