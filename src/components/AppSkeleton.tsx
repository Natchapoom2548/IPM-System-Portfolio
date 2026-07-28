import React from "react";

export function AppSkeleton() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 animate-pulse" id="app-skeleton">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-slate-900 flex-shrink-0 hidden md:flex flex-col h-full justify-between p-4 border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo & App Title Skeleton */}
          <div className="flex items-center gap-3 p-2 border-b border-slate-800/80 pb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex-shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
          </div>

          {/* Nav Items Skeleton */}
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-10 bg-slate-800/60 rounded-xl w-full flex items-center px-3 gap-3">
                <div className="w-5 h-5 bg-slate-700/60 rounded flex-shrink-0" />
                <div className="h-3.5 bg-slate-700/60 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* User Profile Footer Skeleton */}
        <div className="p-3 bg-slate-800/50 rounded-xl flex items-center justify-between border border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="h-3.5 bg-slate-700 rounded w-20" />
              <div className="h-2.5 bg-slate-700/60 rounded w-12" />
            </div>
          </div>
          <div className="w-6 h-6 bg-slate-700/60 rounded flex-shrink-0" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Skeleton */}
        <div className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="flex items-center gap-4">
            <div className="h-9 bg-slate-100 rounded-lg w-64 hidden sm:block border border-slate-200/80" />
            <div className="w-9 h-9 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Main Viewport Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50">
          <PageContentSkeleton />
        </div>
      </div>
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" id="page-content-skeleton">
      {/* Title & Subtitle */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 rounded-lg w-64" />
          <div className="h-4 bg-slate-200/70 rounded w-44" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-36 hidden sm:block" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24" />
              <div className="w-8 h-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-8 bg-slate-200 rounded-md w-16" />
            <div className="h-2.5 bg-slate-100 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Main Table / Data Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="h-10 bg-slate-100 rounded-xl w-72" />
          <div className="flex gap-2">
            <div className="h-10 bg-slate-100 rounded-xl w-28" />
            <div className="h-10 bg-slate-100 rounded-xl w-28" />
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between px-4 gap-4">
              <div className="h-4 bg-slate-200 rounded w-1/6" />
              <div className="h-4 bg-slate-200/80 rounded w-1/4" />
              <div className="h-4 bg-slate-200/60 rounded w-1/5" />
              <div className="h-6 bg-slate-200/90 rounded-full w-20" />
              <div className="h-8 bg-slate-200/70 rounded-lg w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
