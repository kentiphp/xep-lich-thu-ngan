"use client";

import { useState, useEffect } from "react";
import { Employee, EmployeePreferences } from "@/types";
import { getDefaultEmployees } from "@/lib/schedule";
import EmployeeManager from "@/components/EmployeeManager";
import ShiftPreferenceManager from "@/components/ShiftPreferenceManager";
import Link from "next/link";

export default function QuanLyNhanVienPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [preferences, setPreferences] = useState<EmployeePreferences[]>([]);
  const [mounted, setMounted] = useState(false);
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
          setEmployees(getDefaultEmployees());
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
        setEmployees(getDefaultEmployees());
        setMounted(true);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleUpdateEmployees = async (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);

    // Save all employees to database
    try {
      for (const emp of updatedEmployees) {
        await fetch("/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emp),
        });
      }
    } catch (error) {
      console.error("Error saving employees:", error);
    }
  };

  const handleUpdatePreferences = async (
    updatedPreferences: EmployeePreferences[]
  ) => {
    setPreferences(updatedPreferences);

    // Save preferences to database
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPreferences),
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
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

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 IT-TTC - Hệ thống xếp lịch thu ngân</p>
        </footer>
      </div>
    </div>
  );
}
