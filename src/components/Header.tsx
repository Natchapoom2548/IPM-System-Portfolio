/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { HardDrive, Printer, Search } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onSearch: (query: string) => void;
  onPrint?: () => void;
}

export default function Header({ activeTab, onSearch, onPrint }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim());
    }
  };

  return (
    <header
      className="h-16 bg-white border-b border-slate-200 px-2 sm:px-3 md:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm"
      id="app-header"
    >
      <div className="flex items-center gap-3 font-sans">
        <span className="hidden xl:inline text-xs font-bold text-slate-400 tracking-wider font-mono">
          IPM System For BME
        </span>
        <span className="hidden xl:inline text-slate-300">|</span>
        <span className="hidden xl:inline text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
          {getBreadcrumb()}
        </span>
        <span className="text-[10px] font-black tracking-wider px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
          <span className="hidden sm:inline">Portfolio Demo - Fictional Data</span>
          <span className="sm:hidden">DEMO</span>
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <form onSubmit={handleSubmit} className="relative w-28 sm:w-64 md:w-80">
          <label htmlFor="quick-search" className="sr-only">ค้นหาอุปกรณ์</label>
          <input
            id="quick-search"
            type="text"
            placeholder="ค้นหาด่วน (เช่น S03-PM-001)"
            value={searchVal}
            onChange={(event) => setSearchVal(event.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-all duration-150 text-slate-700 placeholder:text-slate-400 font-sans"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <button type="submit" className="hidden">Search</button>
        </form>

        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 rounded-lg"
          title="Temporary changes are stored only in this browser"
        >
          <HardDrive className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Local demo storage</span>
        </div>

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
