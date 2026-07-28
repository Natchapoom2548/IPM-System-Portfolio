/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  User,
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  HeartPulse
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../utils/api";

interface LoginScreenProps {
  onLogin: (username: string, role: "admin" | "registration" | "reporting" | "ipm" | "repair", profilePic?: string, token?: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track mouse position for background spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("กรุณากรอกรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || "รหัสผ่านไม่ถูกต้อง");
        setIsSubmitting(false);
        return;
      }

      const matchedUser = await res.json();
      onLogin(matchedUser.username, matchedUser.role, matchedUser.profilePic, matchedUser.token);
      setErrorMsg("");
    } catch {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-screen overflow-x-hidden overflow-y-auto font-sans select-none relative bg-[#010618]" 
      id="auth-main-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key="login-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen w-screen flex flex-col justify-between p-4 sm:p-6 md:p-10 lg:p-12 relative overflow-hidden"
          id="login-view-container"
        >
          {/* BACKGROUND ANIMATION AND LAYERS */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Elegant Tech Grid System */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.05)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(30,58,138,0.05)_1.5px,transparent_1.5px)] bg-[size:40px_40px]" />
            
            {/* Dynamic Mouse-tracking Neon Spotlight */}
            {isHovering && (
              <motion.div
                className="absolute rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-400/10 blur-[100px] w-[500px] h-[500px]"
                animate={{
                  x: mousePos.x - 250,
                  y: mousePos.y - 250,
                }}
                transition={{ type: "spring", damping: 40, stiffness: 70, mass: 0.8 }}
              />
            )}

            {/* Glowing flowing medical radial - EMERALD */}
            <motion.div 
              animate={{
                x: [0, 45, -30, 0],
                y: [0, -50, 40, 0],
                scale: [1, 1.15, 0.9, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[15%] left-[5%] w-[450px] h-[450px] rounded-full bg-emerald-500/[0.04] blur-[100px]"
            />

            {/* Glowing flowing medical radial - BLUE */}
            <motion.div 
              animate={{
                x: [0, -60, 50, 0],
                y: [0, 40, -50, 0],
                scale: [1, 0.9, 1.15, 1],
              }}
              transition={{
                duration: 22,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] rounded-full bg-blue-600/[0.08] blur-[120px]"
            />

            {/* Glowing flowing medical radial - CYAN */}
            <motion.div 
              animate={{
                x: [0, 30, -50, 0],
                y: [0, 60, -30, 0],
                scale: [1, 1.1, 0.85, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] blur-[130px]"
            />

            {/* Technical Diagnostic Circular Medical Scan/Radar - Top Right */}
            <div className="absolute right-[5%] top-[8%] w-[450px] h-[450px] opacity-[0.25] hidden lg:block">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="w-full h-full rounded-full border border-blue-500/10 flex items-center justify-center relative"
              >
                <div className="w-[390px] h-[390px] rounded-full border border-dashed border-cyan-500/15" />
                <div className="absolute w-[290px] h-[290px] rounded-full border border-blue-500/5 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    className="w-[210px] h-[210px] rounded-full border border-dashed border-emerald-500/20 flex items-center justify-center"
                  >
                    <div className="w-[100px] h-[100px] rounded-full border-2 border-double border-cyan-400/20" />
                  </motion.div>
                </div>
                {/* Axis indicators */}
                <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-gradient-to-b from-cyan-500/30 via-transparent to-cyan-500/30" />
                <div className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-gradient-to-r from-cyan-500/30 via-transparent to-cyan-500/30" />
              </motion.div>
            </div>

            {/* DNA Double Helix Structure - Floating Left */}
            <div className="absolute left-[3%] top-[12%] w-[120px] h-[550px] opacity-[0.14] hidden xl:block">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <svg viewBox="0 0 100 450" className="w-full h-full text-cyan-400">
                  <g fill="none" stroke="currentColor" strokeWidth="2">
                    {/* Helix Wave Alpha */}
                    <path d="M10,20 Q30,50 50,20 T90,20 M10,80 Q30,110 50,80 T90,80 M10,140 Q30,170 50,140 T90,140 M10,200 Q30,230 50,200 T90,200 M10,260 Q30,290 50,260 T90,260 M10,320 Q30,350 50,320 T90,320 M10,380 Q30,410 50,380 T90,380" className="opacity-30" />
                    {/* Helix Wave Beta */}
                    <path d="M90,20 Q70,50 50,20 T10,20 M90,80 Q70,110 50,80 T10,80 M90,140 Q70,170 50,140 T10,140 M90,200 Q70,230 50,200 T10,200 M90,260 Q70,290 50,260 T10,260 M90,320 Q70,350 50,320 T10,320 M90,380 Q70,410 50,380 T10,380" className="opacity-70" />
                    {/* Connecting Base Pairs */}
                    <line x1="25" y1="35" x2="75" y2="35" strokeWidth="1" className="opacity-40 text-blue-400" />
                    <line x1="25" y1="95" x2="75" y2="95" strokeWidth="1" className="opacity-40 text-emerald-400" />
                    <line x1="25" y1="155" x2="75" y2="155" strokeWidth="1" className="opacity-40 text-blue-400" />
                    <line x1="25" y1="215" x2="75" y2="215" strokeWidth="1" className="opacity-40 text-emerald-400" />
                    <line x1="25" y1="275" x2="75" y2="275" strokeWidth="1" className="opacity-40 text-blue-400" />
                    <line x1="25" y1="335" x2="75" y2="335" strokeWidth="1" className="opacity-40 text-emerald-400" />
                    <line x1="25" y1="395" x2="75" y2="395" strokeWidth="1" className="opacity-40 text-blue-400" />
                  </g>
                  {/* Glowing Molecule Nodes */}
                  <g fill="currentColor">
                    <circle cx="10" cy="20" r="3" className="text-emerald-400" />
                    <circle cx="90" cy="20" r="3.5" className="text-cyan-400" />
                    <circle cx="10" cy="80" r="3.5" className="text-cyan-400" />
                    <circle cx="90" cy="80" r="3" className="text-emerald-400" />
                    <circle cx="10" cy="140" r="3" className="text-emerald-400" />
                    <circle cx="90" cy="140" r="3.5" className="text-cyan-400" />
                    <circle cx="10" cy="200" r="3.5" className="text-cyan-400" />
                    <circle cx="90" cy="200" r="3" className="text-emerald-400" />
                    <circle cx="10" cy="260" r="3" className="text-emerald-400" />
                    <circle cx="90" cy="260" r="3.5" className="text-cyan-400" />
                    <circle cx="10" cy="320" r="3.5" className="text-cyan-400" />
                    <circle cx="90" cy="320" r="3" className="text-emerald-400" />
                    <circle cx="10" cy="380" r="3" className="text-emerald-400" />
                    <circle cx="90" cy="380" r="3.5" className="text-cyan-400" />
                  </g>
                </svg>
              </motion.div>
            </div>

            {/* Glowing Bio-Telemetry ECG Waveforms - Spanning bottom area */}
            <div className="absolute bottom-6 left-0 w-full h-[180px] opacity-[0.25]">
              <svg viewBox="0 0 1440 180" className="w-full h-full text-cyan-500" preserveAspectRatio="none">
                {/* Emerald Wave */}
                <motion.path 
                  d="M 0 90 L 150 90 L 170 90 L 190 60 L 210 120 L 230 30 L 250 150 L 270 80 L 290 100 L 310 90 L 600 90 L 620 50 L 640 130 L 660 15 L 680 165 L 700 80 L 720 100 L 740 90 L 1050 90 L 1070 60 L 1090 120 L 1110 30 L 1130 150 L 1150 80 L 1170 100 L 1190 90 L 1440 90" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  className="drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]"
                  initial={{ strokeDasharray: "1440", strokeDashoffset: "1440" }}
                  animate={{ strokeDashoffset: [1440, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                {/* Main Cyan Active ECG wave */}
                <motion.path 
                  d="M 0 90 L 280 90 L 300 90 L 320 65 L 340 115 L 360 35 L 380 145 L 400 82 L 420 98 L 440 90 L 820 90 L 840 60 L 860 120 L 880 20 L 900 160 L 920 80 L 940 100 L 960 90 L 1250 90 L 1270 65 L 1290 115 L 1310 35 L 1330 145 L 1350 82 L 1370 98 L 1390 90 L 1440 90" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="2.5" 
                  className="drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                  initial={{ strokeDasharray: "1440", strokeDashoffset: "0" }}
                  animate={{ strokeDashoffset: [0, -1440] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>

            {/* Floating Medical Cross "+" Particles with gentle random drift */}
            <motion.div 
              animate={{ y: [0, -15, 0], x: [0, 8, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[18%] text-rose-500/20 text-3xl font-light select-none"
            >
              +
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], x: [0, -10, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[45%] right-[22%] text-cyan-400/15 text-4xl font-extralight select-none"
            >
              +
            </motion.div>
            <motion.div 
              animate={{ y: [0, -12, 0], x: [0, -8, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[28%] left-[28%] text-blue-500/25 text-2xl font-light select-none"
            >
              +
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0], x: [0, 12, 0] }} 
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-[40%] right-[12%] text-emerald-400/15 text-3xl font-extralight select-none"
            >
              +
            </motion.div>
          </div>

          {/* Top-Left Logo Block with Hover Micro-interaction */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-4 max-w-7xl mx-auto w-full pt-2">
            <motion.div 
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 35px rgba(59,130,246,0.4)",
                borderColor: "rgba(16,185,129,0.5)"
              }}
              className="h-12 sm:h-14 px-3 sm:px-5 bg-[#051336]/90 rounded-xl border border-blue-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(59,130,246,0.2)] shrink-0 cursor-pointer transition-colors duration-300"
            >
              <div className="flex items-center gap-1.5 font-sans">
                <span className="text-3xl font-black tracking-widest text-white leading-none">BME</span>
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-2xl font-black text-rose-500 leading-none"
                >
                  +
                </motion.span>
              </div>
            </motion.div>
            <div className="hidden sm:block space-y-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white leading-none">BIOMED</span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-cyan-400 leading-none">ENGINEERING SYSTEM</span>
              </div>
              <div className="pt-0.5">
                <h1 className="text-sm font-extrabold text-slate-100 tracking-tight leading-none">
                  ระบบบริหารจัดการงานวิศวกรรมชีวการแพทย์
                </h1>
                <p className="text-[10px] text-blue-300/60 font-mono tracking-wide leading-none mt-1">
                  Biomedical Engineering Management System
                </p>
              </div>
            </div>
          </div>

          {/* Centered Login Card with Sleek Hover Border Highlight and Tilting effect */}
          <div className="relative z-10 flex-1 flex items-center justify-center my-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(59,130,246,0.6)", 
                boxShadow: "0 30px 80px rgba(0,0,0,0.8), 0 0 35px rgba(6,182,212,0.15)"
              }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 120 
              }}
              className="w-full max-w-lg bg-[#0a1532]/85 border border-blue-900/40 rounded-[28px] p-5 sm:p-8 lg:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.6)] space-y-6 transition-colors duration-300 backdrop-blur-md"
            >
              <div className="space-y-2 relative">
                <div className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-black tracking-[0.16em] text-amber-300">
                  PORTFOLIO DEMO · FICTIONAL DATA
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
                    เข้าสู่ระบบ 
                    <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                  </h2>
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-rose-500/80"
                  >
                    <HeartPulse className="h-5 w-5" />
                  </motion.div>
                </div>
                <p className="text-xs text-slate-400">Demonstration accounts only. No production or patient data is used.</p>
              </div>

              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold"
                  role="alert"
                  aria-live="polite"
                >
                  {errorMsg}
                </motion.div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Username Field with Interactive Glow */}
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 group-hover:opacity-50 transition-opacity duration-300"
                  />
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                    <label htmlFor="demo-username" className="sr-only">ชื่อผู้ใช้งาน</label>
                    <input
                      id="demo-username"
                      type="text"
                      autoComplete="username"
                      placeholder="ชื่อผู้ใช้งาน (Username)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#030a1c]/95 text-xs border border-blue-950/60 focus:border-blue-500 hover:border-slate-800 text-white rounded-xl outline-none transition-all placeholder:text-slate-500 font-semibold focus:ring-1 focus:ring-blue-500/30"
                    />
                  </div>
                </div>

                {/* Password Field with Interactive Glow */}
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 group-hover:opacity-50 transition-opacity duration-300"
                  />
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
                    <label htmlFor="demo-password" className="sr-only">รหัสผ่าน</label>
                    <input
                      id="demo-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="รหัสผ่าน (Password)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-11 py-3 bg-[#030a1c]/95 text-xs border border-blue-950/60 focus:border-blue-500 hover:border-slate-800 text-white rounded-xl outline-none transition-all placeholder:text-slate-500 font-semibold focus:ring-1 focus:ring-blue-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-medium text-slate-500 pt-1">
                  Credentials are configured locally through environment variables.
                </div>

                {/* CTA Submit Button with Interactive Micro-interaction */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { 
                    scale: 1.02, 
                    backgroundColor: "#2563eb",
                    boxShadow: "0 0 25px rgba(37,99,235,0.6)"
                  } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={`w-full py-3 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-[0_4px_20px_rgba(29,111,220,0.35)] flex items-center justify-center gap-2 ${
                    isSubmitting 
                      ? "bg-blue-600/70 cursor-wait animate-pulse" 
                      : "bg-[#1d6fdc] cursor-pointer group-btn"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังติดต่อเซิร์ฟเวอร์เพื่อตรวจสอบสิทธิ์...</span>
                    </>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Bottom-Left Secure Connection Badge with Hover Glow */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="relative z-10 max-w-7xl mx-auto w-full flex items-center gap-3 border-t border-slate-900/50 pt-4 cursor-pointer" 
            id="secure-footer"
          >
            <motion.svg 
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3 }}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-blue-500 shrink-0"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 11l2 2 4-4" />
            </motion.svg>
            <div className="text-[10px] leading-tight">
              <p className="font-bold text-slate-300 hover:text-white transition-colors">ระบบสาธิตสำหรับผลงาน Portfolio</p>
              <p className="font-mono text-slate-500 mt-0.5">Demo environment · Sample data only</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
