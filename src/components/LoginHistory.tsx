import React, { useState, useEffect } from "react";
import { 
  LogIn, 
  Clock, 
  User, 
  Shield, 
  RefreshCw, 
  Search, 
  Calendar,
  CheckCircle2
} from "lucide-react";
import { apiFetch } from "../utils/api";

interface LoginRecord {
  id: number;
  username: string;
  full_name?: string;
  role?: string;
  login_time: string;
  login_count: number;
}

export default function LoginHistory() {
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/user-logins");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch login history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (item.username && item.username.toLowerCase().includes(q)) ||
      (item.full_name && item.full_name.toLowerCase().includes(q)) ||
      (item.role && item.role.toLowerCase().includes(q))
    );
  });

  const getRoleBadge = (role?: string) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">ผู้ดูแลระบบ (Admin)</span>;
      case "registration":
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">ฝ่ายลงทะเบียน</span>;
      case "reporting":
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">ฝ่ายรายงานผล</span>;
      case "ipm":
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-200">ฝ่าย IPM</span>;
      case "repair":
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">ฝ่ายซ่อม</span>;
      default:
        return <span className="inline-block px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-50 text-slate-700 border border-slate-200">ผู้ใช้งาน</span>;
    }
  };

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const day = d.getDate();
      const months = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const month = months[d.getMonth()];
      const yearBE = d.getFullYear() + 543;
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");

      return `${day} ${month} ${yearBE} เวลา ${hours}:${minutes}:${seconds} น.`;
    } catch {
      return dateStr;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      
      if (diffSec < 60) return "เมื่อสักครู่นี้";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
      const diffDay = Math.floor(diffHour / 24);
      return `${diffDay} วันที่แล้ว`;
    } catch {
      return "";
    }
  };

  const totalLoginEvents = history.length;
  const uniqueUsersCount = new Set(history.map(h => (h.username || "").toLowerCase())).size;
  const latestLogin = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-6" id="login-history-view">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#0f2a75] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <span className="inline-block px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold tracking-wider uppercase font-sans text-blue-200">
            ประวัติการเข้าสู่ระบบ (Login Access Logs)
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <LogIn className="h-7 w-7 text-blue-300" />
            <span>บันทึกประวัติการเข้าสู่ระบบ</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-sans">
            แสดงข้อมูลการเข้าสู่ระบบของผู้ใช้งานผ่านหน้า Login โดยบันทึกเวลาที่ล็อกอินและจำนวนครั้งการเข้าใช้งานสะสมของแต่ละบัญชี
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="px-5 py-3 bg-white text-[#0f2a75] hover:bg-blue-50 active:bg-blue-100 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>อัปเดตข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0f2a75] shrink-0">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalLoginEvents} <span className="text-sm font-normal text-slate-500">ครั้ง</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              จำนวนการล็อกอินสะสมทั้งหมด
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {uniqueUsersCount} <span className="text-sm font-normal text-slate-500">ท่าน</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              ผู้ใช้งานทั้งหมดที่เคยล็อกอิน
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">ล็อกอินล่าสุด</div>
            <div className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {latestLogin ? (latestLogin.full_name || latestLogin.username) : "-"}
            </div>
            <div className="text-[11px] text-amber-700 font-medium">
              {latestLogin ? formatRelativeTime(latestLogin.login_time) : "ยังไม่มีข้อมูล"}
            </div>
          </div>
        </div>
      </div>

      {/* Main List and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้ใช้งาน หรือ ชื่อ-นามสกุล..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 font-semibold text-slate-700"
            />
          </div>
          <div className="text-[11px] font-bold text-slate-400 font-mono">
            แสดงผลทั้งหมด {filteredHistory.length} จาก {totalLoginEvents} รายการ
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-bold text-slate-600">กำลังโหลดประวัติการเข้าสู่ระบบ...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <LogIn className="w-8 h-8" />
            </div>
            <p className="text-base font-extrabold text-slate-800">ยังไม่มีประวัติการเข้าสู่ระบบ</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              เมื่อผู้ใช้งานทำการเข้าสู่ระบบผ่านหน้า Login ข้อมูลเวลาและจำนวนครั้งจะถูกบันทึกและแสดงที่นี่โดยอัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">ผู้ใช้งาน (Username)</th>
                  <th className="p-4">ระดับสิทธิ์ (Role Group)</th>
                  <th className="p-4 text-center">เข้าสู่ระบบสะสม</th>
                  <th className="p-4 text-right">เวลาที่เข้าสู่ระบบ (Timestamp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredHistory.map((record, index) => (
                  <tr key={record.id || index} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-mono font-bold text-[#0f2a75] uppercase shrink-0">
                          {(record.full_name || record.username || "U").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{record.full_name || record.username}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{record.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(record.role)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#0f2a75] border border-blue-100 font-mono shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        ครั้งที่ {record.login_count || 1}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-slate-800 flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {formatThaiDate(record.login_time)}
                      </div>
                      <div className="text-[11px] text-blue-600 font-semibold text-right mt-0.5">
                        {formatRelativeTime(record.login_time)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
