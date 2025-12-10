"use client";

import { useState, useEffect } from "react";
import { Employee, WeekSchedule, EmployeePreferences } from "@/types";
import {
  getDefaultEmployees,
  getMonday,
  generateWeekSchedule,
  updateDayOff,
  updateShiftAssignment,
} from "@/lib/schedule";
import WeekNavigator from "@/components/WeekNavigator";
import ViewOnlySchedule from "@/components/ViewOnlySchedule";
import WeekScheduleView from "@/components/WeekScheduleView";
import Link from "next/link";

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [preferences, setPreferences] = useState<EmployeePreferences[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"simple" | "detailed">("simple");
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Fetch employees
        const empRes = await fetch("/api/employees");
        const empData = await empRes.json();
        if (Array.isArray(empData) && empData.length > 0) {
          setEmployees(empData);
        } else {
          // Initialize with default employees if none exist
          const defaultEmps = getDefaultEmployees();
          for (const emp of defaultEmps) {
            await fetch("/api/employees", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emp),
            });
          }
          setEmployees(defaultEmps);
        }

        // Fetch preferences
        const prefRes = await fetch("/api/preferences");
        const prefData = await prefRes.json();
        if (Array.isArray(prefData)) {
          setPreferences(prefData);
        }

        setMounted(true);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback to default data
        setEmployees(getDefaultEmployees());
        setMounted(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Load schedule from database when week or employees change
  useEffect(() => {
    if (!mounted || employees.length === 0) return;

    async function loadSchedule() {
      const weekStart = currentWeekStart.toISOString().split("T")[0];

      try {
        const res = await fetch(`/api/schedule?weekStart=${weekStart}`);
        const savedSchedule = await res.json();

        if (savedSchedule && savedSchedule.weekStart) {
          setSchedule(savedSchedule);
        } else {
          // Generate new schedule
          const newSchedule = generateWeekSchedule(
            currentWeekStart,
            employees,
            undefined,
            preferences
          );
          setSchedule(newSchedule);

          // Save to database
          await fetch("/api/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weekStart, schedule: newSchedule }),
          });
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      }
    }

    loadSchedule();
  }, [schedule, currentWeekStart, mounted]);

  const handleUpdateEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    // Regenerate schedule with new employee names
    if (schedule) {
      const newSchedule = generateWeekSchedule(
        currentWeekStart,
        updatedEmployees,
        schedule,
        preferences
      );
      setSchedule(newSchedule);
    }
  };

  const handleWeekChange = (newWeekStart: Date) => {
    setCurrentWeekStart(newWeekStart);
  };

  const handleToggleDayOff = async (
    date: string,
    employeeId: string,
    isOff: boolean
  ) => {
    if (!schedule) return;

    const updatedSchedule = updateDayOff(
      schedule,
      date,
      employeeId,
      isOff,
      employees,
      preferences
    );
    setSchedule(updatedSchedule);

    // Save to database
    const weekStart = currentWeekStart.toISOString().split("T")[0];
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, schedule: updatedSchedule }),
    });
  };

  const handleUpdateShift = async (
    date: string,
    shiftType: "ca1" | "ca2",
    employeeIds: string[]
  ) => {
    if (!schedule) return;

    const updatedSchedule = updateShiftAssignment(
      schedule,
      date,
      shiftType,
      employeeIds
    );
    setSchedule(updatedSchedule);

    // Save to database
    const weekStart = currentWeekStart.toISOString().split("T")[0];
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, schedule: updatedSchedule }),
    });
  };

  const handleRegenerateSchedule = async () => {
    const newSchedule = generateWeekSchedule(
      currentWeekStart,
      employees,
      undefined,
      preferences
    );
    setSchedule(newSchedule);

    // Save to database
    const weekStart = currentWeekStart.toISOString().split("T")[0];
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, schedule: newSchedule }),
    });
  };

  if (!mounted || !schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📅 Lịch làm việc tuần
          </h1>
          <p className="text-gray-600">
            Xem lịch làm việc của nhân viên thu ngân
          </p>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white shadow-lg">
              📅 Xem lịch làm việc
            </div>
            <Link
              href="/quanlynhanvien"
              className="px-6 py-3 rounded-lg font-semibold transition bg-white text-gray-700 hover:bg-gray-100 shadow-md"
            >
              👥 Quản lý nhân viên
            </Link>
          </div>

          {/* View mode switcher */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => setViewMode("simple")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "simple"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              📊 Xem dạng bảng
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === "detailed"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              📝 Xem chi tiết & Chỉnh sửa
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleRegenerateSchedule}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
            >
              ♻️ Tạo lại lịch tự động
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          <WeekNavigator
            currentWeekStart={currentWeekStart}
            onWeekChange={handleWeekChange}
          />

          {viewMode === "simple" ? (
            <ViewOnlySchedule schedule={schedule} employees={employees} />
          ) : (
            <WeekScheduleView
              schedule={schedule}
              employees={employees}
              onToggleDayOff={handleToggleDayOff}
              onUpdateShift={handleUpdateShift}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 IT-TTC - Hệ thống xếp lịch thu ngân</p>
        </footer>
      </div>
    </div>
  );
}
