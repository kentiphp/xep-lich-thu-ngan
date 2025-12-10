"use client";

import { useState, useEffect } from "react";
import { Employee, WeekSchedule, EmployeePreferences } from "@/types";
import {
  getDefaultEmployees,
  getMonday,
  generateWeekSchedule,
  updateDayOff,
  updateShiftAssignment,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/lib/schedule";
import WeekNavigator from "@/components/WeekNavigator";
import ViewOnlySchedule from "@/components/ViewOnlySchedule";
import WeekScheduleView from "@/components/WeekScheduleView";
import Link from "next/link";

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>(() =>
    typeof window !== "undefined"
      ? loadFromLocalStorage<Employee[]>("employees", getDefaultEmployees())
      : getDefaultEmployees()
  );
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getMonday(new Date())
  );
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [preferences, setPreferences] = useState<EmployeePreferences[]>(() =>
    typeof window !== "undefined"
      ? loadFromLocalStorage<EmployeePreferences[]>("preferences", [])
      : []
  );
  const mounted = true; // Always mounted on client
  const [viewMode, setViewMode] = useState<"simple" | "detailed">("simple");

  // Generate schedule when week changes or employees change
  useEffect(() => {
    if (!mounted) return;

    const savedScheduleKey = `schedule_${
      currentWeekStart.toISOString().split("T")[0]
    }`;
    const savedSchedule = loadFromLocalStorage<WeekSchedule | null>(
      savedScheduleKey,
      null
    );

    if (savedSchedule) {
      setSchedule(savedSchedule);
    } else {
      const newSchedule = generateWeekSchedule(
        currentWeekStart,
        employees,
        undefined,
        preferences
      );
      setSchedule(newSchedule);
      saveToLocalStorage(savedScheduleKey, newSchedule);
    }
  }, [currentWeekStart, employees, mounted, preferences]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!mounted) return;
    saveToLocalStorage("employees", employees);
  }, [employees, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveToLocalStorage("preferences", preferences);
  }, [preferences, mounted]);

  useEffect(() => {
    if (!mounted || !schedule) return;
    const scheduleKey = `schedule_${
      currentWeekStart.toISOString().split("T")[0]
    }`;
    saveToLocalStorage(scheduleKey, schedule);
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

  const handleToggleDayOff = (
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
  };

  const handleUpdateShift = (
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
  };

  const handleRegenerateSchedule = () => {
    const newSchedule = generateWeekSchedule(
      currentWeekStart,
      employees,
      undefined,
      preferences
    );
    setSchedule(newSchedule);
    const scheduleKey = `schedule_${
      currentWeekStart.toISOString().split("T")[0]
    }`;
    saveToLocalStorage(scheduleKey, newSchedule);
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
      </div>
    </div>
  );
}
