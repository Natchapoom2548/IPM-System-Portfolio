/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  Activity, 
  Plus, 
  LayoutDashboard, 
  ClipboardList, 
  ClipboardCheck, 
  Wrench, 
  FileText, 
  Search,
  LogOut,
  Shield,
  User,
  LogIn
} from "lucide-react";
import appLogo from "../assets/images/app-logo.jpg";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRegisterForm: () => void;
  currentUser?: { username: string; role: "admin" | "registration" | "reporting" | "ipm" | "repair"; profilePic?: string } | null;
  onLogout?: () => void;
  onEditProfile?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenRegisterForm,
  currentUser,
  onLogout,
  onEditProfile
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "แดชบอร์ดสรุปผล", icon: LayoutDashboard },
    { id: "registry", label: "ฝ่ายลงทะเบียน", icon: ClipboardList },
    { id: "ipm", label: "ฝ่าย IPM", icon: ClipboardCheck },
    { id: "repair", label: "ฝ่ายซ่อม", icon: Wrench },
    { id: "reporting", label: "ฝ่ายรายงานผล", icon: FileText },
    { id: "search", label: "ค้นหาเครื่อง", icon: Search },
    ...(currentUser?.role === "admin" ? [
      { id: "users", label: "จัดการสิทธิ์ผู้ใช้งาน", icon: Shield },
      { id: "loginHistory", label: "ประวัติการเข้าสู่ระบบ", icon: LogIn }
    ] : [])
  ];

  const getRoleThaiLabel = (role: string) => {
    switch(role) {
      case "admin": return "ผู้ดูแลระบบ";
      case "registration": return "ฝ่ายลงทะเบียน";
      case "reporting": return "ฝ่ายรายงานผล";
      case "ipm": return "ฝ่าย IPM";
      case "repair": return "ฝ่ายซ่อมแซม";
      default: return "ผู้ใช้งานทั่วไป";
    }
  };

  const getRoleColorClass = (role: string) => {
    switch(role) {
      case "admin": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "registration": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "reporting": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "ipm": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "repair": return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="w-20 lg:w-64 bg-[#0f1d4a] text-white flex flex-col h-full flex-shrink-0 border-r border-[#1a2d6b] transition-all duration-300" id="app-sidebar">
      {/* Brand Section */}
      <div className="p-3 lg:p-5 flex items-center justify-center lg:justify-start gap-3 border-b border-[#1d2f6f]">
        <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-md w-12 h-12 flex-shrink-0 overflow-hidden">
          <img 
            src={appLogo}
            alt="Medical device lifecycle system logo"
            className="h-full w-full object-contain rounded"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0 lg:block hidden">
          <h1 className="font-bold tracking-tight text-[12px] leading-tight text-slate-100 font-sans">
            ระบบบริหารวงจรเครื่องมือแพทย์
          </h1>
          <p className="text-[10px] text-blue-300 font-mono mt-0.5 uppercase tracking-wider">
            Portfolio Demo - Fictional Data
          </p>
        </div>
      </div>

      {/* Admin Title */}
      <div className="px-5 pt-6 pb-2 lg:flex hidden items-center justify-between">
        <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-widest font-sans">
          ฝ่ายบริหารงานสนับสนุน
        </p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-2 lg:px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;
          return (
            <motion.button
              key={item.id}
              id={`menu-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center justify-center lg:justify-start gap-3 h-11 px-2.5 lg:px-4 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer overflow-hidden ${
                isActive
                  ? "text-white font-semibold"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveBg"
                  className="absolute inset-0 bg-[#1e3a8a] border-l-4 border-blue-400 z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center justify-center lg:justify-start gap-3 w-full">
                <IconComponent className={`h-5 w-5 lg:h-4 lg:w-4 ${isActive ? "text-blue-400" : "text-blue-300"}`} />
                <span className="lg:block hidden truncate">{item.label}</span>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Profile/Footer Section */}
      <div className="p-2 lg:p-4 border-t border-[#1d2f6f] bg-[#0c173c] space-y-3">
        <div 
          className="flex items-center justify-center lg:justify-start gap-3 p-2 lg:-mx-2 rounded-xl hover:bg-[#1d2f6f]/50 cursor-pointer transition-colors"
          onClick={onEditProfile}
          title="คลิกเพื่อแก้ไขโปรไฟล์และรหัสผ่าน"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-900/50 overflow-hidden flex items-center justify-center shadow-md border border-[#1d2f6f] flex-shrink-0 text-blue-300">
            {currentUser?.profilePic ? (
              <img src={currentUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div className="overflow-hidden flex-1 lg:block hidden">
            <p className="text-xs font-semibold text-slate-100 truncate" title={currentUser?.username || "ยังไม่ได้เข้าสู่ระบบ"}>
              {currentUser?.username || "Guest User"}
            </p>
            {currentUser && (
              <span className={`inline-block px-2 py-0.5 mt-1 text-[9px] font-bold rounded-full border ${getRoleColorClass(currentUser.role)}`}>
                {getRoleThaiLabel(currentUser.role)}
              </span>
            )}
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full h-11 lg:h-auto py-2 px-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 border border-rose-900/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-5 w-5 lg:h-3.5 lg:w-3.5" />
            <span className="lg:block hidden truncate">ออกจากระบบ / สลับฝ่าย</span>
          </button>
        )}
      </div>
    </div>
  );
}
