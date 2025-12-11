"use client";

import { Employee, ShiftPreferenceType, EmployeePreferences } from "@/types";
import { useState } from "react";

interface ShiftPreferenceManagerProps {
  employees: Employee[];
  preferences: EmployeePreferences[];
  onUpdatePreferences: (preferences: EmployeePreferences[]) => void;
}

const WEEKDAYS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

const PREFERENCE_OPTIONS: {
  value: ShiftPreferenceType;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: "morning",
    label: "Ca sáng",
    color: "text-blue-700",
    bgColor: "bg-blue-100 hover:bg-blue-200 border-blue-300",
  },
  {
    value: "evening",
    label: "Ca tối",
    color: "text-purple-700",
    bgColor: "bg-purple-100 hover:bg-purple-200 border-purple-300",
  },
  {
    value: "off",
    label: "Nghỉ",
    color: "text-red-700",
    bgColor: "bg-red-100 hover:bg-red-200 border-red-300",
  },
  {
    value: "any",
    label: "Tùy ý",
    color: "text-gray-700",
    bgColor: "bg-gray-100 hover:bg-gray-200 border-gray-300",
  },
];

export default function ShiftPreferenceManager({
  employees,
  preferences,
  onUpdatePreferences,
}: ShiftPreferenceManagerProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    employees[0]?.id || ""
  );

  const getEmployeePreference = (
    employeeId: string,
    dayOfWeek: number
  ): ShiftPreferenceType => {
    const empPref = preferences.find((p) => p.employeeId === employeeId);
    const dayPref = empPref?.preferences.find((d) => d.dayOfWeek === dayOfWeek);
    return dayPref?.preference || "any";
  };

  const handlePreferenceChange = (
    employeeId: string,
    dayOfWeek: number,
    preference: ShiftPreferenceType
  ) => {
    const updatedPreferences = [...preferences];
    const empIndex = updatedPreferences.findIndex(
      (p) => p.employeeId === employeeId
    );

    if (empIndex === -1) {
      // Tạo mới preference cho nhân viên
      updatedPreferences.push({
        employeeId,
        preferences: [{ dayOfWeek, preference }],
      });
    } else {
      // Cập nhật preference
      const empPref = updatedPreferences[empIndex];
      const dayIndex = empPref.preferences.findIndex(
        (d) => d.dayOfWeek === dayOfWeek
      );

      if (dayIndex === -1) {
        empPref.preferences.push({ dayOfWeek, preference });
      } else {
        empPref.preferences[dayIndex].preference = preference;
      }
    }

    onUpdatePreferences(updatedPreferences);
  };

  const getPreferenceOption = (pref: ShiftPreferenceType) => {
    return PREFERENCE_OPTIONS.find((opt) => opt.value === pref);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Yêu cầu ca làm việc
      </h2>

      {/* Chọn nhân viên */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn nhân viên:
        </label>
        <div className="flex gap-2 flex-wrap">
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setSelectedEmployee(emp.id)}
              className={`px-4 py-2 rounded-lg border-2 transition flex items-center gap-2 ${
                selectedEmployee === emp.id
                  ? "border-blue-500 bg-blue-50 font-semibold"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: emp.color }}
              />
              {emp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bảng yêu cầu ca */}
      {selectedEmployee && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600 mb-3">
            Chọn ca mong muốn cho từng ngày trong tuần:
          </div>

          {WEEKDAYS.map((day, index) => {
            const currentPref = getEmployeePreference(selectedEmployee, index);

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-800 w-24">{day}</div>
                  <div className="flex gap-2 flex-wrap">
                    {PREFERENCE_OPTIONS.map((option) => {
                      const isSelected = currentPref === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handlePreferenceChange(
                              selectedEmployee,
                              index,
                              option.value
                            )
                          }
                          className={`px-4 py-2 rounded-md border-2 transition ${
                            isSelected
                              ? `${option.bgColor} border-2 font-semibold ${option.color}`
                              : "border-gray-300 hover:border-gray-400 text-gray-600"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tóm tắt yêu cầu */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">
          Tóm tắt yêu cầu của tất cả nhân viên:
        </h3>
        <div className="space-y-2">
          {employees.map((emp) => {
            const empPref = preferences.find((p) => p.employeeId === emp.id);
            const hasPreferences =
              empPref?.preferences && empPref.preferences.length > 0;

            return (
              <div key={emp.id} className="flex items-start gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: emp.color }}
                />
                <div>
                  <span className="font-medium">{emp.name}:</span>
                  {hasPreferences ? (
                    <span className="ml-2 text-gray-600">
                      {empPref.preferences
                        .filter((p) => p.preference !== "any")
                        .map((p) => {
                          const option = getPreferenceOption(p.preference);
                          return `${WEEKDAYS[p.dayOfWeek]} - ${option?.label}`;
                        })
                        .join(", ") || "Chưa có yêu cầu đặc biệt"}
                    </span>
                  ) : (
                    <span className="ml-2 text-gray-400">Chưa có yêu cầu</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
