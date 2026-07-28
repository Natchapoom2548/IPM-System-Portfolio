import React, { useState, useEffect } from "react";
import { User, X, Camera, Save, Lock } from "lucide-react";
import { motion } from "motion/react";
import { apiFetch } from "../utils/api";

interface UserProfileModalProps {
  currentUser: any;
  onClose: () => void;
  onUpdateProfile: (updatedData: any) => void;
}

export default function UserProfileModal({ currentUser, onClose, onUpdateProfile }: UserProfileModalProps) {
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(currentUser?.profilePic || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsersList(data);
        const me = data.find((u: any) => u.username === currentUser.username);
        if (me) {
          setPassword("");
          setProfilePic(me.profilePic || "");
        }
      })
      .catch(e => console.error(e));
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usersList.some((u) => u.username === currentUser.username)) {
      setErrorMsg("ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    const updatedUsers = usersList.map((u) => {
      if (u.username === currentUser.username) {
        return { ...u, password: password.trim(), profilePic };
      }
      return u;
    });

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUsers)
      });

      onUpdateProfile({ ...currentUser, profilePic });
      setSuccessMsg("บันทึกข้อมูลเรียบร้อยแล้ว");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      setErrorMsg("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600" />
            ตั้งค่าโปรไฟล์
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
              {successMsg}
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
              <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-slate-300" />
                )}

                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="เปลี่ยนรูปโปรไฟล์"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">คลิกเพื่อเปลี่ยนรูปโปรไฟล์</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-username" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ชื่อผู้ใช้งาน</label>
              <input
                id="profile-username"
                type="text"
                value={currentUser.username}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="profile-password" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">รหัสผ่านใหม่ (ไม่บังคับ)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="profile-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-mono transition-all"
                  placeholder="เว้นว่างเพื่อคงเดิม (หรือกรอกเพื่อเปลี่ยน)"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </motion.div>
    </div>
  );
}
