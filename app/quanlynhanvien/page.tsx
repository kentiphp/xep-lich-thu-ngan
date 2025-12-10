"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeePreferences } from "@/types";
import {
  getDefaultEmployees,
  saveToLocalStorage,
  loadFromLocalStorage,
} from "@/lib/schedule";
import EmployeeManager from "@/components/EmployeeManager";
import ShiftPreferenceManager from "@/components/ShiftPreferenceManager";
import Link from "next/link";

export default function QuanLyNhanVienPage() {
  const [employees, setEmployees] = useState<Employee[]>(() =>
    typeof window !== "undefined"
      ? loadFromLocalStorage<Employee[]>("employees", getDefaultEmployees())
      : getDefaultEmployees()
  );
  const [preferences, setPreferences] = useState<EmployeePreferences[]>(() =>
    typeof window !== "undefined"
      ? loadFromLocalStorage<EmployeePreferences[]>("preferences", [])
      : []
  );
  const mounted = true; // Always mounted on client

  // Save to localStorage when data changes
  useEffect(() => {
    if (!mounted) return;
    saveToLocalStorage("employees", employees);
  }, [employees, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveToLocalStorage("preferences", preferences);
  }, [preferences, mounted]);

  const handleUpdateEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
  };

  const handleUpdatePreferences = (
    updatedPreferences: EmployeePreferences[]
  ) => {
    setPreferences(updatedPreferences);
  };

  if (!mounted) {
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
            👥 Quản lý nhân viên
          </h1>
          <p className="text-gray-600">
            Thêm, sửa, xóa nhân viên và thiết lập yêu cầu ca làm việc
          </p>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/"
              className="px-6 py-3 rounded-lg font-semibold transition bg-white text-gray-700 hover:bg-gray-100 shadow-md"
            >
              📅 Xem lịch làm việc
            </Link>
            <div className="px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white shadow-lg">
              👥 Quản lý nhân viên
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          {/* Section 1: Quản lý nhân viên */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmployeeManager
              employees={employees}
              onUpdateEmployees={handleUpdateEmployees}
            />

            {/* Info card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 h-fit">
              <h3 className="font-semibold text-blue-800 mb-3 text-lg">
                💡 Hướng dẫn & Quy định
              </h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>
                  • <strong>Thêm nhân viên:</strong> Tạo nhân viên mới với màu
                  riêng
                </li>
                <li>
                  • <strong>Nhân viên trám ca 🔧:</strong> Chỉ xếp khi thiếu
                  người hoặc có người nghỉ
                </li>
                <li>
                  • <strong>Số người/ca:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>- 2 nhân viên: 1 người/ca</li>
                    <li>- 3 nhân viên: Ca 1 có 2 người, Ca 2 có 1 người</li>
                    <li>- 4 nhân viên: 2 người/ca</li>
                    <li>- 5 nhân viên: Ca 1 có 3 người, Ca 2 có 2 người</li>
                  </ul>
                </li>
                <li>
                  • <strong>Xếp lịch công bằng:</strong> Mỗi người làm 1
                  ca/ngày, trừ nhân viên trám ca khi cần
                </li>
                <li>• Thiết lập yêu cầu ca làm ở phần bên dưới</li>
              </ul>
            </div>
          </div>

          {/* Section 2: Yêu cầu ca làm việc */}
          <div>
            <ShiftPreferenceManager
              employees={employees}
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
            />
          </div>

          {/* Action button */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg text-lg"
            >
              ✅ Hoàn tất & Xem lịch làm việc
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
