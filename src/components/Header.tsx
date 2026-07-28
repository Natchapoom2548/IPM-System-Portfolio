/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Printer, LogOut } from "lucide-react";
import { initAuth, isFirebaseConfigured, googleSignIn, logoutGoogle } from "../lib/firebase-auth";
import type { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  onSearch: (query: string) => void;
  onPrint?: () => void;
}

export default function Header({ activeTab, onSearch, onPrint }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error('Google login failed:', err);
        alert('ไม่สามารถเชื่อมต่อ Google Workspace ได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
  };

  const getBreadcrumb = () => {
    switch (activeTab) {
      case "dashboard":
        return "แดชบอร์ดสรุปผลทั้งหมด";
      case "registry":
        return "1. ฝ่ายลงทะเบียนครุภัณฑ์";
      case "ipm":
        return "2. ฝ่ายตรวจสอบความปลอดภัย IPM";
      case "repair":
        return "3. ฝ่ายประเมินและส่งซ่อม";
      case "reporting":
        return "4. ฝ่ายออกใบรับรองและรายงานผล";
      case "search":
        return "5. ค้นหาครุภัณฑ์การแพทย์";
      case "registerForm":
        return "ลงทะเบียนครุภัณฑ์ใหม่";
      default:
        return "แดชบอร์ดสรุปผลทั้งหมด";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-2 sm:px-3 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm" id="app-header">
      {/* Title & Path */}
      <div className="flex items-center gap-3 font-sans">
        <span className="hidden xl:inline text-xs font-bold text-slate-400 tracking-wider font-mono">IPM System For BME</span>
        <span className="hidden xl:inline text-slate-300">|</span>
        <span className="hidden xl:inline text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
          {getBreadcrumb()}
        </span>
        <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
          DEMO
        </span>
      </div>

      {/* Actions: Search, Print, etc. */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="relative w-28 sm:w-64 md:w-80">
          <label htmlFor="quick-search" className="sr-only">ค้นหาอุปกรณ์</label>
          <input
            id="quick-search"
            type="text"
            placeholder="ค้นหาด่วน (เช่น S03-PM-001)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-all duration-150 text-slate-700 placeholder:text-slate-400 font-sans"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Google Workspace Auth */}
        {!googleUser ? (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn || !isFirebaseConfigured}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={isFirebaseConfigured ? "Connect Google Sheets" : "Google Sheets is not configured for this demo"}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span className="hidden lg:inline">{isLoggingIn ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ Sheets"}</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-sm">
            <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span className="hidden lg:inline" title={googleUser.email || ""}>เชื่อมต่อ Sheets แล้ว</span>
            <button onClick={handleGoogleLogout} className="ml-1 text-emerald-600 hover:text-emerald-800" title="ยกเลิกการเชื่อมต่อ">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Print Button */}
        <button
          onClick={onPrint || (() => window.print())}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all border border-slate-200"
          title="พิมพ์หน้านี้"
          aria-label="พิมพ์หน้านี้"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
