/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  X, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Wrench, 
  Award,
  Database,
  ShieldCheck,
  History,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Droplets,
  Activity
} from "lucide-react";
import { MedicalDevice } from "../types";

interface DeviceDetailModalProps {
  device: MedicalDevice | null;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, onClose }: DeviceDetailModalProps) {
  if (!device) return null;

  const [showChecklists, setShowChecklists] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 font-sans" id="device-detail-modal">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0f1d4a] text-white p-5 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold text-blue-300 font-mono tracking-widest uppercase">
              Clinical Equipment Record
            </span>
            <h3 className="text-base font-extrabold flex items-center gap-2 mt-0.5">
              <Database className="h-4.5 w-4.5 text-blue-400" />
              รายละเอียด: {device.id}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-blue-200 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Status & Risk Section */}
          <div className="flex justify-between items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <p className="text-slate-400 text-[10px] font-bold">สถานะเวิร์กโฟลว์ปัจจุบัน:</p>
              <strong className="text-slate-800 mt-0.5 block">
                {device.status === "Registration" && "1. ขึ้นทะเบียนครุภัณฑ์"}
                {device.status === "IPM" && "2. ฝ่าย IPM (รอตรวจความปลอดภัย)"}
                {device.status === "Repair" && "3. ฝ่ายประเมินส่งซ่อม"}
                {device.status === "Reporting" && "4. ฝ่ายรายงานผล (รอออกใบรับรอง)"}
                {device.status === "Completed" && "อนุมัติผ่านเกณฑ์มาตรฐานเรียบร้อย"}
              </strong>
            </div>
          </div>

          {/* Specifications spec box */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              คุณสมบัติทางเทคนิค (Technical Specs)
            </h4>
            <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-100 font-medium">
              <div>
                <span className="text-slate-400 block text-[9px]">ชื่อครุภัณฑ์:</span>
                <p className="text-slate-800">{device.name}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">รหัสครุภัณฑ์:</span>
                <p className="text-slate-800 font-mono">{device.equipmentNo}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">หมายเลขสตรี (Serial No):</span>
                <p className="text-slate-800 font-mono">{device.serialNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">ยี่ห้อ / รุ่น:</span>
                <p className="text-slate-800">{device.manufacturer} / {device.model}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">แผนกสังกัด:</span>
                <p className="text-slate-800">{device.department} ({device.location})</p>
              </div>
            </div>
          </div>

          {/* Electrical Safety Test (ESA) results if performed */}
          {(device.ipmCheckDate || device.repairDate || device.certificateNo) && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ประวัติการตรวจเช็คทางคลินิก (Clinical Test Status)
              </h4>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                {/* IPM Info */}
                {device.ipmCheckDate && (
                  <div className="flex gap-2 items-start border-b border-slate-100 pb-2">
                    <ShieldCheck className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">การทดสอบทางไฟฟ้าและประสิทธิภาพ:</p>
                      <p className="text-slate-500 mt-0.5">
                        ผลตรวจ: <strong className={device.ipmCheckResult === "Passed" ? "text-emerald-600" : "text-rose-600"}>
                          {device.ipmCheckResult === "Passed" ? "ผ่านเกณฑ์มาตรฐาน" : "ไม่ผ่านเกณฑ์ (ตกวิเคราะห์)"}
                        </strong>
                      </p>
                      <p className="text-slate-500">โดย: {device.ipmTester} เมื่อวันที่ {device.ipmCheckDate}</p>
                      <p className="text-slate-400 mt-0.5 italic">"{device.ipmNotes}"</p>
                    </div>
                  </div>
                )}

                {/* Repair Info */}
                {device.repairDate && (
                  <div className="flex gap-2 items-start border-b border-slate-100 py-2">
                    <Wrench className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">การซ่อมบำรุงและเปลี่ยนอะไหล่:</p>
                      <p className="text-slate-500">โดยช่างเทคนิค: {device.repairTechnician} เมื่อวันที่ {device.repairDate}</p>
                      <p className="text-slate-500">ค่าอะไหล่และบริการ: <strong className="font-mono text-slate-800">{device.repairCost} บาท</strong></p>
                      <p className="text-slate-400 mt-0.5 italic">"{device.repairDetails}"</p>
                    </div>
                  </div>
                )}

                {/* Compliance certificate info */}
                {device.certificateNo && (
                  <div className="flex gap-2 items-start pt-2">
                    <Award className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">ใบอนุญาตความปลอดภัย (Compliance Cert):</p>
                      <p className="text-slate-500">เลขที่ใบรับรอง: <strong className="font-mono text-slate-800">{device.certificateNo}</strong></p>
                      <p className="text-slate-500">ได้รับการอนุมัติโดย: Dr. {device.approvedBy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IPM Detailed Checklists */}
          {(device.qualitativeTasks || device.quantitativeTasks) && (
            <div className="space-y-2 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
              <button
                type="button"
                onClick={() => setShowChecklists(!showChecklists)}
                className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-blue-600" />
                  <div>
                    <span className="font-extrabold text-xs text-slate-800 block">รายงานตรวจสอบความปลอดภัยชีวการแพทย์ (IPM Report)</span>
                    <span className="text-[10px] text-slate-400">คลิกเพื่อขยายดูจุดตรวจสอบกายภาพและประสิทธิภาพตู้อบ</span>
                  </div>
                </div>
                {showChecklists ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showChecklists && (
                <div className="p-4 border-t border-slate-100 bg-white space-y-4 max-h-[300px] overflow-y-auto animate-in slide-in-from-top-2 duration-150 text-[11px]">
                  {/* Lab environment */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                      Lab Temp: <strong>{device.temperature}°C</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      Humidity: <strong>{device.humidity}%</strong>
                    </span>
                  </div>

                  {/* Qualitative tasks */}
                  {device.qualitativeTasks && (
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">ตรวจสอบเชิงกายภาพ (Qualitative Tasks):</h5>
                      <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 bg-slate-50/20">
                        {device.qualitativeTasks.map((task, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 text-[10px]">
                            <span className="text-slate-600">{task.taskName}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                task.result === "PASS"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : task.result === "FAIL"
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {task.result}
                              </span>
                              {task.comment && <span className="text-[9px] text-slate-400 italic font-sans max-w-[120px] truncate" title={task.comment}>({task.comment})</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantitative tasks */}
                  {device.quantitativeTasks && (
                    <div className="space-y-1.5 pt-1">
                      <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">ประสิทธิภาพและไฟฟ้าชีวการแพทย์ (Quantitative):</h5>
                      <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 bg-slate-50/20 font-sans">
                        {device.quantitativeTasks.map((task, idx) => (
                          <div key={idx} className="p-2 text-[10px] space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-700">{task.groupLabel} ({task.controlSetting})</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                task.result === "PASS"
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : task.result === "FAIL"
                                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {task.result}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-[9px] text-slate-400 font-mono">
                              <span>Criteria: {task.criteria}</span>
                              <span>Display: {task.display}</span>
                              <span>Measured: {task.measured}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
