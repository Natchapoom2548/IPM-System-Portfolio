/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Database, 
  FileCheck, 
  Wrench, 
  Clock, 
  Award, 
  Lightbulb 
} from "lucide-react";
import { MedicalDevice } from "../types";
import { HOSPITALS } from "../data/mockData";

interface DashboardProps {
  devices: MedicalDevice[];
  setActiveTab: (tab: string) => void;
  onOpenDeviceDetail: (id: string) => void;
}

export default function Dashboard({ devices, setActiveTab, onOpenDeviceDetail }: DashboardProps) {
  const [selectedProvince, setSelectedProvince] = useState<"ตัวอย่างเหนือ" | "ตัวอย่างกลาง">("ตัวอย่างเหนือ");

  const getDeviceProvince = (device: MedicalDevice): "ตัวอย่างเหนือ" | "ตัวอย่างกลาง" | null => {
    let hospital = HOSPITALS.find(h => h.name === device.department);
    if (!hospital) {
      hospital = HOSPITALS.find(h => h.name === device.location);
    }
    return hospital ? hospital.province : null;
  };

  const filteredDevices = devices.filter((d) => {
    return getDeviceProvince(d) === selectedProvince;
  });

  // Compute dynamic stats based on filtered devices
  const totalCount = filteredDevices.length;
  
  // Counts by workflow status
  const registrationCount = filteredDevices.filter((d) => d.status === "Registration").length;
  const ipmCount = filteredDevices.filter((d) => d.status === "IPM").length;
  const repairCount = filteredDevices.filter((d) => d.status === "Repair").length;
  const reportingCount = filteredDevices.filter((d) => d.status === "Reporting").length;
  const completedCount = filteredDevices.filter((d) => d.status === "Completed").length;

  const awaitingCheckCount = registrationCount + ipmCount; // 2 + 2 = 4
  const finalCompletedCount = completedCount; // 1

  // Let's compute percentages for circular status:
  const completedRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const incompleteRate = 100 - completedRate;
  const incompleteCount = totalCount - completedCount;

  // Filter hospitals based on selected province
  const filteredHospitals = HOSPITALS.filter((h) => {
    return h.province === selectedProvince;
  });

  const hospitalData = filteredHospitals.map((hosp) => {
    const hospDevices = devices.filter((d) => d.department === hosp.name || d.location === hosp.name);
    const count = hospDevices.length;
    const awaitingDelivery = hospDevices.filter((d) => d.status === "Registration" || d.status === "IPM").length;
    const maintenance = hospDevices.filter((d) => d.status === "Repair").length;
    const passed = hospDevices.filter((d) => d.status === "Reporting" || d.status === "Completed").length;

    return {
      id: hosp.id,
      name: hosp.name,
      label: hosp.name,
      province: hosp.province,
      count,
      awaitingDelivery,
      maintenance,
      passed,
      deviceList: hospDevices
    };
  });

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Dynamic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0f2a75] p-8 text-white shadow-xl flex flex-col justify-between min-h-[220px]">
        {/* Cardiac Wave Background */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
            <motion.path
              d="M 10 100 L 100 100 L 120 40 L 140 160 L 160 80 L 170 110 L 180 100 L 300 100 L 320 30 L 340 170 L 360 70 L 370 110 L 380 100 H 400"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.3 }}
              animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
              transition={{ 
                pathLength: { duration: 4, ease: "linear", repeat: Infinity, repeatType: "loop" },
                opacity: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
              }}
            />
          </svg>
        </div>

        {/* Banner Content */}
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4 max-w-2xl relative z-10"
        >
          <span className="inline-block px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold tracking-wider uppercase font-sans text-blue-200">
            สถิติการดำเนินงานระบบ IPM System For BME
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            แผงควบคุมสรุปข้อมูลเครื่องมือแพทย์ (Executive Dashboard)
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed font-sans">
            ข้อมูลสรุปความปลอดภัยและประสิทธิภาพการตรวจวัดประสิทธิภาพเชิงป้องกัน (IPM) สำหรับกลุ่มงานวิศวกรรมการแพทย์แบบเรียลไทม์เพื่อตรวจสอบความพร้อมใช้ของอุปกรณ์ชในโรงพยาบาลและรพ.สต
          </p>
        </motion.div>
      </div>

      {/* Province Selector Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 font-sans" id="province-filter-bar">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </span>
          <div className="text-center sm:text-left">
            <h4 className="text-xs font-black tracking-wider uppercase text-blue-900">เลือกพื้นที่เขตจังหวัด (Select Province Area)</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">กรองแสดงข้อมูลเครื่องและ รพ.สต. เฉพาะจังหวัดที่ระบุ</p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setSelectedProvince(selectedProvince === "ตัวอย่างเหนือ" ? "ตัวอย่างกลาง" : "ตัวอย่างเหนือ")}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-2xl font-bold transition-all shadow-sm hover:shadow active:scale-95 text-xs group"
            title="คลิกเพื่อสลับจังหวัด"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>📍 จังหวัด{selectedProvince}</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-[10px] text-blue-600 font-extrabold flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              สลับเป็นจังหวัด {selectedProvince === "ตัวอย่างเหนือ" ? "ตัวอย่างกลาง" : "ตัวอย่างเหนือ"}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: เครื่องทั้งหมดในระบบ */}
        <motion.div 
          onClick={() => setActiveTab("registry")}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.05 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          id="kpi-card-total"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Database className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">เครื่องทั้งหมดในระบบ</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {totalCount} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-blue-600 font-semibold">
            <span>ครุภัณฑ์ทั้งหมด</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>

        {/* Card 2: รอส่งมอบ / รอตรวจเช็ค */}
        <motion.div 
          onClick={() => setActiveTab("ipm")}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          id="kpi-card-awaiting"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">รอส่งมอบ / รอตรวจเช็ค</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {awaitingCheckCount} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-amber-600 font-semibold">
            <span>ลงทะเบียน &amp; ตรวจสอบ</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>

        {/* Card 3: ฝ่ายประเมินและส่งซ่อม */}
        <motion.div 
          onClick={() => setActiveTab("repair")}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          id="kpi-card-repair"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">ฝ่ายประเมินและส่งซ่อม</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {repairCount} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-rose-600 font-semibold">
            <span>อยู่ระหว่างซ่อมบำรุง</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>

        {/* Card 4: อยู่ฝ่ายรายงานผล */}
        <motion.div 
          onClick={() => setActiveTab("reporting")}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          id="kpi-card-reporting"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">อยู่ฝ่ายรายงานผล</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {reportingCount} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-purple-600 font-semibold">
            <span>รอรายงานสถิติ</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>

        {/* Card 5: ส่งตรวจผ่านแล้ว */}
        <motion.div 
          onClick={() => setActiveTab("reporting")}
          whileHover={{ y: -6, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.25 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          id="kpi-card-completed"
        >
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-xs text-slate-400 font-medium">ส่งตรวจผ่านแล้ว</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {finalCompletedCount} <span className="text-sm font-normal text-slate-500">เครื่อง</span>
            </p>
          </div>
          <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>ดูใบรับรอง</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </motion.div>
      </div>

      {/* Row of Charts & Proportions (Image 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: สรุปสถานะการตรวจสอบเรียลไทม์ (Donut SVG) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-5 flex flex-col justify-between" id="chart-status-donut">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800">สรุปสถานะการตรวจสอบเรียลไทม์</h3>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* SVG Donut */}
          <div className="flex justify-center items-center py-6 relative">
            <svg className="w-48 h-48 transform -rotate-90">
              {/* Underlay Circle */}
              <circle
                cx="96"
                cy="96"
                r="75"
                className="stroke-slate-100"
                strokeWidth="18"
                fill="transparent"
              />
              {/* Dynamic Overlay Orange/Yellow for Incomplete */}
              <circle
                cx="96"
                cy="96"
                r="75"
                className="stroke-amber-400 transition-all duration-1000 ease-out"
                strokeWidth="18"
                strokeDasharray={`${2 * Math.PI * 75}`}
                strokeDashoffset={`${2 * Math.PI * 75 * (1 - incompleteRate / 100)}`}
                fill="transparent"
                strokeLinecap="round"
              />
              {/* Dynamic Overlay Green for Completed (overlapping) */}
              <circle
                cx="96"
                cy="96"
                r="75"
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="18"
                strokeDasharray={`${2 * Math.PI * 75}`}
                strokeDashoffset={`${2 * Math.PI * 75 * (1 - completedRate / 100)}`}
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text inside Donut */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {completedCount}/{totalCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">เครื่องเสร็จสิ้น</span>
              <span className="mt-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                {completedRate}%
              </span>
            </div>
          </div>

          {/* Legends */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/40">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">เสร็จแล้ว (Completed)</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                {completedCount} เครื่อง ({completedRate}%)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/30 rounded-xl border border-amber-100/30">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                <span className="text-slate-600">ยังไม่เสร็จ (Not Completed)</span>
              </div>
              <span className="text-xs font-bold text-amber-600">
                {incompleteCount} เครื่อง ({incompleteRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: สัดส่วนตามขั้นตอนการดำเนินงาน */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-7 flex flex-col justify-between" id="chart-steps-proportions">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
              สัดส่วนตามขั้นตอนการดำเนินงาน
            </h3>

            {/* Steps Progress Bars */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>1. ฝ่ายลงทะเบียน (รอตรวจ)</span>
                  <span className="font-bold text-slate-800">{registrationCount} เครื่อง</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${totalCount > 0 ? (registrationCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>2. ฝ่าย IPM (รออนุมัติ QA)</span>
                  <span className="font-bold text-slate-800">{ipmCount} เครื่อง</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${totalCount > 0 ? (ipmCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>3. ฝ่ายซ่อม (ชำรุด/ซ่อมบำรุง)</span>
                  <span className="font-bold text-slate-800">{repairCount} เครื่อง</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-600 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${totalCount > 0 ? (repairCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Step 4 */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>4. ฝ่ายรายงานผล (ออกใบรับรอง)</span>
                  <span className="font-bold text-slate-800">{reportingCount + completedCount} เครื่อง</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                    style={{ width: `${totalCount > 0 ? ((reportingCount + completedCount) / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: เครื่องแยกตาม รพ.สต. เจ้าของเครื่อง (Image 3) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm" id="dashboard-hospital-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-1.5-3-1m-3.105-3 3 1m-1.137 1-3-1M8.25 21h4.5M12 3h.008v.008H12V3Zm0 3.75h.008v.008H12V6.75Zm0 3.75h.008v.008H12v-.008ZM12 14.25h.008v.008H12v-.008Zm-5.25-3h.008v.008H6.75v-.008Zm0 3.75h.008v.008H6.75v-.008Zm0-7.5h.008v.008H6.75V7.5Zm0-3.75h.008v.008H6.75V3.75Z" />
              </svg>
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              เครื่องแยกตาม รพ.สต. (จังหวัด{selectedProvince})
            </h3>
          </div>

          {/* Interactive Province Selector directly in the section */}
          <div className="flex items-center font-sans self-start sm:self-auto">
            <button
              onClick={() => setSelectedProvince(selectedProvince === "ตัวอย่างเหนือ" ? "ตัวอย่างกลาง" : "ตัวอย่างเหนือ")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 rounded-xl font-bold transition-all active:scale-95 text-[11px] group"
              title="คลิกเพื่อสลับจังหวัด"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              สลับเป็นจังหวัด {selectedProvince === "ตัวอย่างเหนือ" ? "ตัวอย่างกลาง" : "ตัวอย่างเหนือ"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitalData.map((hosp) => (
            <div 
              key={hosp.id} 
              className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all"
            >
              {/* Hospital Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-xs text-slate-700">{hosp.label}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                  {hosp.count} เครื่อง
                </span>
              </div>

              {/* Status Columns Grid */}
              <div className="grid grid-cols-3 gap-2">
                {/* รอส่งมอบ */}
                <div 
                  onClick={() => {
                    if (hosp.awaitingDelivery > 0) setActiveTab("ipm");
                  }}
                  className="bg-amber-50/50 hover:bg-amber-50 border border-amber-100/40 p-2.5 rounded-lg text-center cursor-pointer transition-all"
                >
                  <p className="text-[9px] font-semibold text-amber-700">รอส่งมอบ</p>
                  <p className="text-base font-extrabold text-amber-800 mt-1">{hosp.awaitingDelivery}</p>
                </div>

                {/* ซ่อมบำรุง */}
                <div 
                  onClick={() => {
                    if (hosp.maintenance > 0) setActiveTab("repair");
                  }}
                  className="bg-rose-50/50 hover:bg-rose-50 border border-rose-100/40 p-2.5 rounded-lg text-center cursor-pointer transition-all"
                >
                  <p className="text-[9px] font-semibold text-rose-700">ซ่อมบำรุง</p>
                  <p className="text-base font-extrabold text-rose-800 mt-1">{hosp.maintenance}</p>
                </div>

                {/* ส่งผ่านแล้ว */}
                <div 
                  onClick={() => {
                    if (hosp.passed > 0) setActiveTab("reporting");
                  }}
                  className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/40 p-2.5 rounded-lg text-center cursor-pointer transition-all"
                >
                  <p className="text-[9px] font-semibold text-emerald-700">ส่งผ่านแล้ว</p>
                  <p className="text-base font-extrabold text-emerald-800 mt-1">{hosp.passed}</p>
                </div>
              </div>

              {/* Dynamic device quick list */}
              {hosp.deviceList.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100/60 flex flex-wrap gap-1">
                  {hosp.deviceList.map((dev) => (
                    <button
                      key={dev.id}
                      onClick={() => onOpenDeviceDetail(dev.id)}
                      className="text-[9px] font-mono font-semibold px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                      title={`${dev.name} - Status: ${dev.status}`}
                    >
                      {dev.id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
