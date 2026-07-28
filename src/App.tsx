/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

// lazy load pages
const AssetRegistry = lazy(() => import("./components/AssetRegistry"));
const IPMWorkflow = lazy(() => import("./components/IPMWorkflow"));
const RepairWorkflow = lazy(() => import("./components/RepairWorkflow"));
const ReportingWorkflow = lazy(() => import("./components/ReportingWorkflow"));
const SearchWorkflow = lazy(() => import("./components/SearchWorkflow"));
const RegistrationForm = lazy(() => import("./components/RegistrationForm"));
const DeviceDetailModal = lazy(() => import("./components/DeviceDetailModal"));
const LoginScreen = lazy(() => import("./components/LoginScreen"));
const UserManagement = lazy(() => import("./components/UserManagement"));
const UserProfileModal = lazy(() => import("./components/UserProfileModal"));
const LoginHistory = lazy(() => import("./components/LoginHistory"));
import type { MedicalDevice } from "./types";
import { INITIAL_DEVICES } from "./data/mockData";
import { convertDeviceToBE, getTodayStrBE, getTodayDateTimeStrBE } from "./utils/dateUtils";
import { apiFetch } from "./utils/api";

import { AppSkeleton, PageContentSkeleton } from "./components/AppSkeleton";

export default function App() {
  // session
  const [currentUser, setCurrentUser] = useState<{ username: string; role: "admin" | "registration" | "reporting" | "ipm" | "repair"; profilePic?: string; token?: string } | null>(() => {
    const saved = localStorage.getItem("current_user_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
    return null;
  });

  // load devices
  const [devices, setDevices] = useState<MedicalDevice[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsLoaded(false);
      return;
    }

    apiFetch('/api/devices')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
            setDevices(data.map(convertDeviceToBE));
        } else {
            setDevices(INITIAL_DEVICES.map(convertDeviceToBE));
        }
        setIsLoaded(true);
      })
      .catch(e => {
        console.error("Error fetching devices", e);
        setDevices(INITIAL_DEVICES.map(convertDeviceToBE));
        setIsLoaded(true);
      });
  }, [currentUser]);


  // Backend sync helpers
  const upsertDeviceBackend = async (device: MedicalDevice) => {
    try {
      await apiFetch(`/api/devices/${device.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
    } catch (e) {
      console.error("Error upserting device", e);
    }
  };

  const deleteDeviceBackend = async (id: string) => {
    try {
      await apiFetch(`/api/devices/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Error deleting device", e);
    }
  };


  // active tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Auto-redirect non-admin users away from admin-only tabs
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      if (["users", "loginHistory"].includes(activeTab)) {
        setActiveTab("dashboard");
      }
    }
  }, [currentUser, activeTab]);

  // modals & search state
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  const [searchedId, setSearchedId] = useState<string | undefined>(undefined);

  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  // GLOBAL ACTIONS & WORKFLOW TRANSITIONS

  // Action: Add registered device
  const handleAddDevice = (newDevice: MedicalDevice) => {
    upsertDeviceBackend(newDevice);
    setDevices((prev) => [newDevice, ...prev]);
    setActiveTab("registry");
  };

  // Action: Import multiple devices via CSV
  const handleImportDevices = (newDevices: MedicalDevice[]) => {
    // Bulk import sync
    apiFetch('/api/devices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDevices) });
    setDevices((prev) => [...newDevices, ...prev]);
    setActiveTab("registry");
  };

  // Action: Delete device
  const handleDeleteDevice = (id: string) => {
    deleteDeviceBackend(id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (selectedDetailId === id) {
      setSelectedDetailId(null);
    }
  };

  // Action: Send to IPM stage (from Registration table)
  const handleSendToIPM = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "IPM",
            workflowStep: 2,
            history: [
              {
                date: todayStr,
                action: "ส่งตรวจเช็ค IPM",
                note: "ส่งต่อให้ฝ่ายตรวจสอบความปลอดภัยและประสิทธิภาพชีวการแพทย์สำหรับการทดสอบประจำรอบ",
                user: ""
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
  };

  // Action: Pass QA Check (QA PASS)
  const handlePassQA = (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "Reporting",
            workflowStep: 4,
            ipmCheckResult: "Passed",
            ipmCheckDate: getTodayStrBE(),
            ipmTester: tester,
            ipmNotes: notes,
            ...details,
            history: [
              {
                date: todayStr,
                action: "ตรวจเช็คผ่านเกณฑ์ (QA PASS)",
                note: notes,
                user: tester
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
  };

  // Action: Fail QA Check (QA FAIL)
  const handleFailQA = (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "Repair",
            workflowStep: 3,
            ipmCheckResult: "Failed",
            ipmCheckDate: getTodayStrBE(),
            ipmTester: tester,
            ipmNotes: notes,
            ...details,
            history: [
              {
                date: todayStr,
                action: "ตรวจเช็คไม่ผ่านเกณฑ์ (QA FAIL)",
                note: `ตกวิเคราะห์ทางเทคนิค: ${notes}`,
                user: tester
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
  };

  // Action: Fail QA Check but approve without repair (QA REJECT -> Reporting)
  const handleFailQAToReporting = (id: string, notes: string, tester: string, details?: Partial<MedicalDevice>) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "Reporting",
            workflowStep: 4,
            ipmCheckResult: "Failed",
            ipmCheckDate: getTodayStrBE(),
            ipmTester: tester,
            ipmNotes: notes,
            ...details,
            history: [
              {
                date: todayStr,
                action: "ตรวจเช็คไม่ผ่านเกณฑ์ถาวร (QA REJECT)",
                note: `ลงบันทึกผลไม่ผ่านเกณฑ์ส่งออกรายงาน: ${notes}`,
                user: tester
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
  };

  // Action: Complete Repair and send back to IPM
  const handleCompleteRepair = (id: string, details: string, cost: number, technician: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "IPM", // Send back to IPM inspection for safety verification
            workflowStep: 2,
            repairDetails: details,
            repairDate: getTodayStrBE(),
            repairCost: cost,
            repairTechnician: technician,
            history: [
              {
                date: todayStr,
                action: "ซ่อมแซมเสร็จสิ้น",
                note: `ซ่อมแซมบำรุงและเปลี่ยนอะไหล่เสร็จสิ้น: ${details} (ค่าบริการ: ${cost} บาท)`,
                user: technician
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
    setActiveTab("ipm");
  };

  // Action: Issue final safety certificate (Release Completed)
  const handleIssueCertificate = (id: string, certNo: string, approvedBy: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const todayStr = getTodayDateTimeStrBE();
          const updated: MedicalDevice = {
            ...d,
            status: "Completed",
            certificateNo: certNo,
            certificateDate: getTodayStrBE(),
            approvedBy: approvedBy,
            history: [
              {
                date: todayStr,
                action: "ออกใบรับรองสำเร็จ (Release)",
                note: `อนุมัติเอกสารรับรองมาตรฐานความปลอดภัยชีวการแพทย์ เลขที่ใบรับรอง: ${certNo}`,
                user: approvedBy
              },
              ...d.history
            ]
          };
          upsertDeviceBackend(updated);
          return updated;
        }
        return d;
      })
    );
  };

  // Search trigger from Header search bar
  const handleGlobalSearch = (query: string) => {
    setSearchedId(query);
    setActiveTab("search");
  };

  // Action: Update existing device
  const handleUpdateDevice = (updatedDevice: MedicalDevice) => {
    upsertDeviceBackend(updatedDevice);
    setDevices((prev) => prev.map((d) => d.id === editingDeviceId ? updatedDevice : d));
    setEditingDeviceId(null);
    setActiveTab("registry");
  };

  const handleUpdateDeviceDirectly = (updatedDevice: MedicalDevice) => {
    upsertDeviceBackend(updatedDevice);
    setDevices((prev) => prev.map((d) => d.id === updatedDevice.id ? updatedDevice : d));
  };

  // Edit device trigger (pre-populate or configure editing)
  const handleEditDevice = (id: string) => {
    setEditingDeviceId(id);
    setActiveTab("registerForm");
  };

  const handleLogin = (username: string, role: "admin" | "registration" | "reporting" | "ipm" | "repair", profilePic?: string, token?: string) => {
    const user = { username, role, profilePic, token };
    setCurrentUser(user);
    localStorage.setItem("current_user_v1", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("current_user_v1");
  };

  const activeDeviceDetail = devices.find((d) => d.id === selectedDetailId) || null;

  if (!currentUser) {
    return (
      <Suspense fallback={<AppSkeleton />}>
        <LoginScreen onLogin={handleLogin} />
      </Suspense>
    );
  }

  if (!isLoaded) {
    return <AppSkeleton />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800" id="main-app-container">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegisterForm={() => {
          setEditingDeviceId(null);
          setActiveTab("registerForm");
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onEditProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Primary Workspace */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* 2. Header Top Bar */}
        <Header
          activeTab={activeTab}
          onSearch={handleGlobalSearch}
        />

        {/* 3. Main content viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="w-full h-full space-y-6"
            >
              <Suspense fallback={<PageContentSkeleton />}>
                {activeTab === "dashboard" && (
                  <Dashboard
                    devices={devices}
                    setActiveTab={setActiveTab}
                    onOpenDeviceDetail={setSelectedDetailId}
                  />
                )}

                {activeTab === "registry" && (
                  <AssetRegistry
                    devices={devices}
                    onOpenRegisterForm={() => {
                      setEditingDeviceId(null);
                      setActiveTab("registerForm");
                    }}
                    onImportDevices={handleImportDevices}
                    onSendToIPM={handleSendToIPM}
                    onDeleteDevice={handleDeleteDevice}
                    onOpenDeviceDetail={setSelectedDetailId}
                    onEditDevice={handleEditDevice}
                    userRole={currentUser.role}
                  />
                )}

                {activeTab === "ipm" && (
                  <IPMWorkflow
                    devices={devices}
                    onPassQA={handlePassQA}
                    onFailQA={handleFailQA}
                    onFailQAToReporting={handleFailQAToReporting}
                    onOpenDeviceDetail={setSelectedDetailId}
                    onSaveDraft={handleUpdateDeviceDirectly}
                    onOpenRegisterForm={() => {
                      setEditingDeviceId(null);
                      setActiveTab("registerForm");
                    }}
                    userRole={currentUser.role}
                  />
                )}

                {activeTab === "repair" && (
                  <RepairWorkflow
                    devices={devices}
                    onCompleteRepair={handleCompleteRepair}
                    onOpenDeviceDetail={setSelectedDetailId}
                    userRole={currentUser.role}
                  />
                )}

                {activeTab === "reporting" && (
                  <ReportingWorkflow
                    devices={devices}
                    onIssueCertificate={handleIssueCertificate}
                    onOpenDeviceDetail={setSelectedDetailId}
                    onUpdateDevice={handleUpdateDeviceDirectly}
                    userRole={currentUser.role}
                  />
                )}

                {activeTab === "search" && (
                  <SearchWorkflow
                    devices={devices}
                    searchedId={searchedId}
                    onClearSearchId={() => setSearchedId(undefined)}
                    onOpenDeviceDetail={setSelectedDetailId}
                  />
                )}

                {activeTab === "registerForm" && (
                  <RegistrationForm
                    onCancel={() => {
                      setEditingDeviceId(null);
                      setActiveTab("registry");
                    }}
                    onSubmit={editingDeviceId ? handleUpdateDevice : handleAddDevice}
                    devices={devices}
                    editDevice={devices.find((d) => d.id === editingDeviceId)}
                    userRole={currentUser.role}
                  />
                )}

                {activeTab === "users" && currentUser.role === "admin" && (
                  <UserManagement />
                )}

                {activeTab === "loginHistory" && currentUser.role === "admin" && (
                  <LoginHistory />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <UserProfileModal
            currentUser={currentUser}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateProfile={(updated) => {
              setCurrentUser(updated);
              localStorage.setItem("current_user_v1", JSON.stringify(updated));
            }}
          />
        </Suspense>
      )}

      {/* 4. Overlay: Detail History Modal popup */}
      <Suspense fallback={null}>
        <DeviceDetailModal
          device={activeDeviceDetail}
          onClose={() => setSelectedDetailId(null)}
        />
      </Suspense>
    </div>
  );
}
