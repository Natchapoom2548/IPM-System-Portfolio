/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Wrench, 
  Settings, 
  Cpu, 
  DollarSign, 
  UserCheck, 
  CheckSquare,
  AlertOctagon,
  PenTool,
  Lock,
  Info
} from "lucide-react";
import { MedicalDevice } from "../types";

interface RepairWorkflowProps {
  devices: MedicalDevice[];
  onCompleteRepair: (id: string, details: string, cost: number, technician: string) => void;
  onOpenDeviceDetail: (id: string) => void;
  userRole?: string;
}

export default function RepairWorkflow({ 
  devices, 
  onCompleteRepair, 
  onOpenDeviceDetail,
  userRole = "admin"
}: RepairWorkflowProps) {
  const canEdit = userRole === "admin" || userRole === "repair";
  // Filter devices in Repair stage
  const repairDevices = devices.filter((d) => d.status === "Repair");

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [techName, setTechName] = useState("");
  const [repairDetails, setRepairDetails] = useState("");
  const [repairError, setRepairError] = useState<string | null>(null);

  const activeDevice = devices.find((d) => d.id === selectedDeviceId);

  const resetForm = () => {
    setSelectedDeviceId(null);
    setRepairDetails("");
    setTechName("");
    setRepairError(null);
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setRepairError(null);
    if (!selectedDeviceId) return;
    if (!repairDetails.trim()) {
      setRepairError("กรุณากรอกรายละเอียดการซ่อม");
      return;
    }
    if (!techName.trim()) {
      setRepairError("กรุณากรอกชื่อผู้ซ่อม");
      return;
    }
    onCompleteRepair(selectedDeviceId, repairDetails, 0, techName);
    resetForm();
  };

  return (
    <div className="space-y-6" id="repair-tab">
      {!canEdit && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-in fade-in duration-150">
          <Info className="h-5 w-5 text-amber-600 shrink-0" />
          <span>คุณกำลังเข้าชมข้อมูลในโหมดผู้สังเกตการณ์ (View Only) เนื่องจากสิทธิ์การแก้ไขและบันทึกงานซ่อมถูกจำกัดไว้เฉพาะเจ้าหน้าที่ฝ่ายซ่อมและผู้ดูแลระบบเท่านั้น</span>
        </div>
      )}

      {/* Title */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl font-extrabold text-slate-800">
          ฝ่ายประเมินและส่งซ่อมครุภัณฑ์การแพทย์ (Clinical Maintenance &amp; Repair)
        </h2>
        <p className="text-xs text-slate-500 font-sans mt-1">
          การวิเคราะห์อาการชำรุด บันทึกเปลี่ยนอะไหล่ชีวการแพทย์ และประเมินราคาซ่อมก่อนส่งกลับไปวัดค่าความปลอดภัย IPM
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Broken / Maintenance queue */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            รายการส่งประเมินและซ่อม ({repairDevices.length} เครื่อง)
          </h3>

          {repairDevices.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-10 rounded-2xl text-center text-slate-400">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">ไม่มีเครื่องชำรุดในระบบในขณะนี้</p>
              <p className="text-xs mt-1">เครื่องที่มีสถานะ "ตรวจไม่ผ่านเกณฑ์" จะมาเข้าคิวการซ่อมบำรุงในส่วนนี้อัตโนมัติ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repairDevices.map((device) => {
                const isSelected = selectedDeviceId === device.id;
                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-red-50/50 border-rose-500 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-rose-600">{device.id}</span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mb-1">{device.name}</h4>
                    
                    {/* Error Description from IPM */}
                    {device.ipmNotes && (
                      <div className="mt-2 p-2 bg-rose-50/60 rounded-lg text-[11px] text-rose-700 font-sans border border-rose-100/40 flex gap-1.5">
                        <AlertOctagon className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                        <p><strong>อาการชำรุด:</strong> {device.ipmNotes}</p>
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                      <span>แผนก: <strong className="text-slate-700">{device.department}</strong></span>
                      <span className="text-rose-600 font-bold hover:underline">
                        ดำเนินการซ่อม &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Interactive Maintenance Log sheet */}
        <div className="lg:col-span-7">
          {activeDevice ? (
            <form onSubmit={handleComplete} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
              {repairError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in duration-150">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-rose-600 shrink-0">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                  <span>{repairError}</span>
                </div>
              )}

              {/* Sheet Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">
                    BIOMED MAINTENANCE REPORT
                  </span>
                  <h3 className="text-base font-extrabold text-slate-800 mt-1">
                    รายงานประเมินและบันทึกการซ่อมบำรุง: {activeDevice.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    {activeDevice.name} (S/N: {activeDevice.serialNumber}) | {activeDevice.location}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => onOpenDeviceDetail(activeDevice.id)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  ประวัติเครื่อง
                </button>
              </div>

              {/* Error reference */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-xs font-sans">
                <p className="font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-rose-500" />
                  รายงานความบกพร่องจากฝ่าย IPM:
                </p>
                <p className="text-slate-600 pl-5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100 italic">
                  "{activeDevice.ipmNotes || "ไม่มีรายละเอียดระบุความบกพร่อง"}"
                </p>
                <div className="flex justify-between text-[10px] text-slate-400 pl-5">
                  <span>ผู้ทดสอบ: <strong>{activeDevice.ipmTester || "ไม่ระบุ"}</strong></span>
                  <span>วันที่ตรวจเช็ค: <strong>{activeDevice.ipmCheckDate || "ไม่ระบุ"}</strong></span>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-1.5">
                  <PenTool className="h-3.5 w-3.5 text-rose-500" />
                  บันทึกเทคนิคและการซ่อมแซม
                </h4>

                {/* Repair Details */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    รายละเอียดการซ่อม (Repair Details) *
                  </label>
                  <textarea
                    required
                    disabled={!canEdit}
                    placeholder={canEdit ? "ระบุรายละเอียดอาการชำรุดและสิ่งที่คุณได้ซ่อมบำรุงไป..." : "คุณไม่มีสิทธิ์แก้ไขหรือกรอกข้อมูลในฝ่ายนี้"}
                    value={repairDetails}
                    onChange={(e) => setRepairDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-blue-500 h-32 resize-none font-sans disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Technicians input */}
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold flex items-center gap-1 text-xs">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    ผู้ซ่อม (Technician) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!canEdit}
                    placeholder={canEdit ? "ชื่อผู้ทำการซ่อมแซม..." : "ไม่มีสิทธิ์บันทึก"}
                    value={techName}
                    onChange={(e) => setTechName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-semibold text-slate-700 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-100 text-slate-500 font-semibold hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!canEdit}
                  id="btn-complete-repair"
                  className={`flex-1 px-4 py-2.5 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                    canEdit 
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-95 cursor-pointer" 
                      : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                  }`}
                  title={canEdit ? "" : "เฉพาะเจ้าหน้าที่ฝ่ายซ่อมเท่านั้นที่สามารถทำรายการได้"}
                >
                  {canEdit ? <CheckSquare className="h-4 w-4" /> : <Lock className="h-4 w-4 text-slate-400" />}
                  บันทึกเสร็จสิ้นส่งกลับไปตรวจเช็ค IPM ใหม่
                </button>
              </div>
            </form>
          ) : (
            <div className="h-full bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col justify-center items-center text-center p-12 text-slate-400">
              <Wrench className="h-16 w-16 mb-4 text-slate-300 animate-pulse" />
              <h3 className="font-bold text-base text-slate-700">เลือกเครื่องมือแพทย์เพื่อทำการซ่อมแซม</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                คลิกเลือกรายการเครื่องมือแพทย์ด้านซ้ายที่มีสถานะชำรุดและตกเกณฑ์ตรวจสอบเพื่อประเมินอาการ กรอกขั้นตอนแก้ไขปัญหาความเสียหาย และทดแทนอะไหล่ก่อนเริ่มงาน
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
