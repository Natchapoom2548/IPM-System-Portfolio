/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  QrCode, 
  User, 
  Calendar, 
  Tag, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Award,
  Maximize2
} from "lucide-react";
import { MedicalDevice } from "../types";

interface SearchWorkflowProps {
  devices: MedicalDevice[];
  onOpenDeviceDetail: (id: string) => void;
  searchedId?: string;
  onClearSearchId?: () => void;
}

export default function SearchWorkflow({ devices, searchedId, onClearSearchId }: SearchWorkflowProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // If a global search ID was passed from Header search
  React.useEffect(() => {
    if (searchedId) {
      setSearchError(null);
      const dev = devices.find((d) => d.id.toLowerCase() === searchedId.toLowerCase() || d.serialNumber.toLowerCase() === searchedId.toLowerCase());
      if (dev) {
        setSelectedDevice(dev);
        setSearchQuery(dev.id);
      } else {
        setSearchError(`ไม่พบอุปกรณ์ที่ใช้รหัส หรือ S/N: "${searchedId}"`);
      }
      if (onClearSearchId) {
        onClearSearchId();
      }
    }
  }, [searchedId, devices, onClearSearchId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    if (!searchQuery.trim()) return;
    const found = devices.find(
      (d) => 
        d.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
        d.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        d.serialNumber.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (found) {
      setSelectedDevice(found);
    } else {
      setSearchError("ไม่พบรหัสครุภัณฑ์หรือชื่อเครื่องดังกล่าวในฐานข้อมูล");
      setSelectedDevice(null);
    }
  };

  // Simulate QR Scanning
  const triggerQrScan = () => {
    setIsScanning(true);
    setSelectedDevice(null);
    setTimeout(() => {
      // Pick a random device to display
      const randDev = devices[Math.floor(Math.random() * devices.length)];
      setSelectedDevice(randDev);
      setSearchQuery(randDev.id);
      setIsScanning(false);
    }, 1800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Registration":
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold border border-blue-100">ฝ่ายลงทะเบียน</span>;
      case "IPM":
        return <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-bold border border-purple-100">ฝ่าย IPM (รอตรวจสอบ)</span>;
      case "Repair":
        return <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-full font-bold border border-rose-100">ฝ่ายซ่อมบำรุง</span>;
      case "Reporting":
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold border border-amber-100">ฝ่ายรายงานผล (รอออกใบรับรอง)</span>;
      case "Completed":
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold border border-emerald-100">รับรองผ่านเกณฑ์เสร็จสิ้น</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="search-tab">
      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-800">
          ค้นหาเครื่องมือแพทย์และตรวจสอบประวัติ (Biomedical Asset Lookup)
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-1">
          การสืบค้นข้อมูลประวัติทางคลินิก, บันทึกการสอบเทียบประสิทธิภาพ, รายการอะไหล่ซ่อมบำรุง, และใบรับรองทางวิศวกรรมการแพทย์ชีวภาพ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Search Panel & QR Scanner */}
        <div className="lg:col-span-4 space-y-6">
          {/* Search Bar Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              พิมพ์รหัสหรือชื่อครุภัณฑ์
            </h3>
            
            {searchError && (
              <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
            
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="เช่น S03-PM-001 หรือ NIBP"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError(null);
                }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-sans"
              />
              <button
                type="submit"
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-all shadow active:scale-95"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Simulated Barcode / QR Code Scanner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-left">
              จำลองกล้องแสกน QR Code / สติกเกอร์ IPM
            </h3>

            {/* Scanner Visual Frame */}
            <div className="relative w-40 h-40 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700 shadow-inner">
              {isScanning ? (
                <>
                  {/* Glowing Laser line */}
                  <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce w-full top-1/2"></div>
                  <QrCode className="h-16 w-16 text-emerald-400 opacity-60 animate-pulse" />
                </>
              ) : (
                <QrCode className="h-16 w-16 text-slate-500 hover:text-slate-400 cursor-pointer transition-colors" onClick={triggerQrScan} />
              )}

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-slate-400"></div>
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-slate-400"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-slate-400"></div>
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-slate-400"></div>
            </div>

            <button
              onClick={triggerQrScan}
              disabled={isScanning}
              id="btn-trigger-scan"
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold py-2 px-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <QrCode className="h-4 w-4 text-slate-500" />
              {isScanning ? "กำลังจำลองระบบสแกน..." : "จำลองการสแกนสติกเกอร์ที่เครื่อง"}
            </button>
          </div>

          {/* Quick list of database devices */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              รายการด่วนในคลังทั้งหมด
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {devices.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDevice(d);
                    setSearchQuery(d.id);
                  }}
                  className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-all ${
                    selectedDevice?.id === d.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {d.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Medical Device Passport Sheet */}
        <div className="lg:col-span-8">
          {selectedDevice ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6" id="device-passport-card">
              {/* Passport Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    BIOMEDICAL SYSTEM DEVICE PASSPORT
                  </span>
                  <h3 className="text-lg font-black text-slate-800 mt-1 flex items-center gap-2">
                    พาสปอร์ตประวัติครุภัณฑ์: {selectedDevice.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    ลงทะเบียนเข้าฐานข้อมูลเมื่อ: {selectedDevice.registrationDate}
                  </p>
                </div>
                {getStatusBadge(selectedDevice.status)}
              </div>

              {/* Technical Specifications Spec sheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 font-sans text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ข้อมูลพื้นฐานครุภัณฑ์</h4>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>ชื่อครุภัณฑ์ (Name):</span>
                      <strong className="text-slate-800">{selectedDevice.name}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>ประเภทเครื่อง (Type):</span>
                      <strong className="text-slate-800">{selectedDevice.deviceType}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>รหัสอุปกรณ์ (ID No.):</span>
                      <strong className="text-slate-800 font-mono">{selectedDevice.equipmentNo}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>หมายเลขสตรี (S/N):</span>
                      <strong className="text-slate-800 font-mono">{selectedDevice.serialNumber}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สังกัดและการสอบถามความปลอดภัย</h4>
                  <div className="space-y-2 text-slate-600">
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>โรงพยาบาล/แผนก:</span>
                      <strong className="text-slate-800">{selectedDevice.location} / {selectedDevice.department}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>ยี่ห้อ / รุ่น (Brand/Model):</span>
                      <strong className="text-slate-800">{selectedDevice.manufacturer} / {selectedDevice.model}</strong>
                    </p>
                    <p className="flex justify-between border-b border-slate-50 pb-1">
                      <span>รอบตรวจ IPM ถัดไป:</span>
                      <strong className="text-slate-800 font-mono">{selectedDevice.ipmDueDate} ({selectedDevice.ipmRound})</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Flow Checklist timeline */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขั้นตอนความก้าวหน้าเวิร์กโฟลว์</h4>
                
                {/* 4 Steps timeline */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold font-sans">
                  {/* Step 1 */}
                  <div className={`p-2 rounded-lg border ${
                    selectedDevice.workflowStep >= 1
                      ? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 mx-auto mb-1 ${selectedDevice.workflowStep >= 1 ? "text-blue-500" : "text-slate-300"}`} />
                    <span>1. ลงทะเบียนครุภัณฑ์</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-2 rounded-lg border ${
                    selectedDevice.workflowStep >= 2
                      ? "bg-purple-50 border-purple-200 text-purple-700 font-bold"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    {selectedDevice.ipmCheckResult === "Failed" ? (
                      <AlertCircle className="h-4 w-4 mx-auto mb-1 text-rose-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className={`h-4 w-4 mx-auto mb-1 ${selectedDevice.workflowStep >= 2 ? "text-purple-500" : "text-slate-300"}`} />
                    )}
                    <span>2. ตรวจสอบความปลอดภัย IPM</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-2 rounded-lg border ${
                    selectedDevice.status === "Repair"
                      ? "bg-rose-50 border-rose-200 text-rose-700 font-bold"
                      : selectedDevice.repairDate
                        ? "bg-slate-100 border-slate-200 text-slate-500 line-through"
                        : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    <Flame className={`h-4 w-4 mx-auto mb-1 ${
                      selectedDevice.status === "Repair" 
                        ? "text-rose-500" 
                        : selectedDevice.repairDate 
                          ? "text-slate-400" 
                          : "text-slate-300"
                    }`} />
                    <span>3. ซ่อมบำรุงเปลี่ยนอะไหล่</span>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-2 rounded-lg border ${
                    selectedDevice.status === "Completed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                  }`}>
                    <Award className={`h-4 w-4 mx-auto mb-1 ${selectedDevice.status === "Completed" ? "text-emerald-500" : "text-slate-300"}`} />
                    <span>4. อนุมัติผ่านพร้อมใช้</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col justify-center items-center text-center p-12 text-slate-400">
              <QrCode className="h-16 w-16 mb-4 text-slate-300 animate-pulse" />
              <h3 className="font-bold text-base text-slate-700">ไม่มีครุภัณฑ์ที่ทำการสืบค้นประวัติ</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                กรุณาป้อนหมายเลข ID หรือสแกนบาร์โค้ดจากแผงควบคุมค้นหาทางซ้าย เพื่อดึงข้อมูลประวัติทางไฟฟ้านิวแมติกและใบรับรองมาตรฐานชีวการแพทย์ขึ้นมาแสดง
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
