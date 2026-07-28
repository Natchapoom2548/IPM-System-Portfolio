/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Shield,
  UserPlus,
  UserX,
  Edit3,
  Check,
  X,
  Search,
  User,
  ShieldAlert,
  Info
} from "lucide-react";
import { apiFetch } from "../utils/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../data/demoAccounts";

export interface UserAccount {
  username: string;
  fullName: string;
  profilePic?: string;
  role: "admin" | "registration" | "reporting" | "ipm" | "repair";
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    apiFetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
            setUsers(data);
        } else {
            setUsers([]);
        }
        setIsLoaded(true);
      })
      .catch(e => {
        console.error("Error fetching users", e);
        setUsers([]);
        setIsLoaded(true);
      });
  }, []);

  // Persist the simulated user list through the browser-local demo API.
  useEffect(() => {
    if (isLoaded) {
      apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(users)
      }).catch(e => console.error("Error saving users", e));
    }
  }, [users, isLoaded]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "registration" | "reporting" | "ipm" | "repair">("registration");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"admin" | "registration" | "reporting" | "ipm" | "repair">("registration");
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);


  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const normalizedUsername = newUsername.trim();
    const normalizedFullName = newFullName.trim();

    if (!normalizedUsername) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้งาน (Username)");
      return;
    }
    if (!normalizedFullName) {
      setErrorMsg("กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    const exists = users.some(
      (u) => u.username.toLowerCase() === normalizedUsername.toLowerCase()
    );
    if (exists) {
      setErrorMsg(`ชื่อผู้ใช้งาน "${normalizedUsername}" มีในระบบแล้ว`);
      return;
    }

    const newUser: UserAccount = {
      username: normalizedUsername,
      fullName: normalizedFullName,
      role: newRole
    };

    setUsers((prev) => [...prev, newUser]);
    setNewUsername("");
    setNewFullName("");
    setNewRole("registration");
    setIsAdding(false);
    setSuccessMsg("เพิ่มรายการผู้ใช้จำลองในเบราว์เซอร์แล้ว (บัญชีนี้ใช้ล็อกอินไม่ได้)");

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    if (usernameToDelete === "demo_admin") {
      setErrorMsg("ไม่สามารถลบบัญชีผู้ดูแลระบบสาธิตหลัก (demo_admin) ได้");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    const targetUser = users.find((u) => u.username === usernameToDelete);
    if (targetUser) {
      setUserToDelete(targetUser);
    }
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.username !== userToDelete.username));
    setSuccessMsg(`ลบผู้ใช้งาน "${userToDelete.username}" สำเร็จ`);
    setUserToDelete(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleStartEdit = (user: UserAccount) => {
    setEditingUsername(user.username);
    setEditingRole(user.role);
  };

  const handleSaveEdit = (usernameToSave: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.username === usernameToSave) {
          return { ...u, role: editingRole };
        }
        return u;
      })
    );
    setEditingUsername(null);
    setSuccessMsg("แก้ไขข้อมูลผู้ใช้งานสำเร็จ");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getRoleThaiLabel = (role: string) => {
    switch(role) {
      case "admin": return "ผู้ดูแลระบบ (Admin)";
      case "registration": return "ฝ่ายลงทะเบียน";
      case "reporting": return "ฝ่ายรายงานผล";
      case "ipm": return "ฝ่าย IPM";
      case "repair": return "ฝ่ายซ่อม";
      default: return role;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case "admin": return "bg-purple-50 text-purple-700 border-purple-200";
      case "registration": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "reporting": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ipm": return "bg-orange-50 text-orange-700 border-orange-200";
      case "repair": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="user-management-workflow">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#0f2a75] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <span className="inline-block px-3 py-1 bg-blue-500/30 border border-blue-400/40 rounded-full text-xs font-semibold tracking-wider uppercase font-sans text-blue-200">
            ระบบจัดการสิทธิ์ผู้ใช้งาน (User Roles & Permissions)
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-blue-300" />
            <span>จัดการสิทธิ์ผู้ใช้งานระบบ</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed font-sans">
            ทดลองเพิ่ม ค้นหา และปรับระดับสิทธิ์ของผู้ใช้สมมติ ข้อมูลทั้งหมดเก็บเฉพาะในเบราว์เซอร์
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3 bg-white text-[#0f2a75] hover:bg-blue-50 active:bg-blue-100 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAdding ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{isAdding ? "ยกเลิก" : "เพิ่มผู้ใช้งานใหม่"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          การเพิ่ม แก้ไข และลบในหน้านี้เป็นการจำลองเท่านั้น เฉพาะบัญชีเดโมที่กำหนดไว้ 5 บัญชีเท่านั้นที่เข้าสู่ระบบได้
          โดยใช้รหัสผ่าน <span className="font-mono font-bold">{DEMO_PASSWORD}</span>
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <ShieldAlert className="h-4 w-4 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add User Panel */}
      {isAdding && (
        <form onSubmit={handleAddUser} className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            ข้อมูลผู้ใช้งานและฝ่ายสังกัดใหม่
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">ชื่อผู้ใช้งาน (Username) *</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="เช่น sample_user_01"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-slate-700 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">ชื่อสมมติ *</label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="เช่น นพ. เอกชัย นามสมมติ"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-slate-700 font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">สิทธิ์การเข้าถึง (Role) *</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-slate-700 font-bold"
              >
                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                <option value="registration">ฝ่ายลงทะเบียน</option>
                <option value="ipm">ฝ่าย IPM</option>
                <option value="repair">ฝ่ายซ่อม</option>
                <option value="reporting">ฝ่ายรายงานผล</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-50">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0f2a75] hover:bg-blue-900 active:bg-blue-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              บันทึกข้อมูลสมาชิก
            </button>
          </div>
        </form>
      )}

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
            แสดงผลทั้งหมด {filteredUsers.length} บัญชี
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">ผู้ใช้งาน (Username)</th>
                <th className="p-4">ชื่อ-นามสกุล</th>
                <th className="p-4">สถานะบัญชีเดโม</th>
                <th className="p-4">ระดับสิทธิ์ (Role Group)</th>
                <th className="p-4 w-24 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <tr key={user.username} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-4 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-mono font-bold text-[#0f2a75] uppercase">
                          {user.username.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-mono">{user.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">สถานะ: เปิดใช้งาน</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {user.fullName}
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {DEMO_ACCOUNTS.some((account) => account.username === user.username) ? (
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          บัญชีล็อกอินเดโม
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
                          รายการจำลองเท่านั้น
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUsername === user.username ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value as any)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-bold text-slate-700"
                          >
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                            <option value="registration">ฝ่ายลงทะเบียน</option>
                            <option value="ipm">ฝ่าย IPM</option>
                            <option value="repair">ฝ่ายซ่อม</option>
                            <option value="reporting">ฝ่ายรายงานผล</option>
                          </select>
                          <button
                            onClick={() => handleSaveEdit(user.username)}
                            className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                            title="บันทึก"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUsername(null)}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="ยกเลิก"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleThaiLabel(user.role)}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingUsername !== user.username && (
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                            title="แก้ไขสิทธิ์"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          disabled={user.username === "demo_admin"}
                          className={`p-1.5 rounded-lg transition-all ${
                            user.username === "demo_admin"
                              ? "text-slate-300 cursor-not-allowed"
                              : "text-rose-600 hover:bg-rose-50 cursor-pointer"
                          }`}
                          title="ลบผู้ใช้"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    ไม่พบข้อมูลผู้ใช้งานที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setUserToDelete(null)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <UserX className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-slate-800">
                  ยืนยันการลบผู้ใช้งาน
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <strong className="text-slate-700">"{userToDelete.fullName}"</strong> ({userToDelete.username}) ออกจากระบบ? การลบนี้ไม่สามารถย้อนคืนได้
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
