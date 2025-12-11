"use client";

import { WeekSchedule, Employee, SHIFTS } from "@/types";
import { parseDate } from "@/lib/schedule";
import { useState } from "react";

interface WeekScheduleViewProps {
  schedule: WeekSchedule;
  employees: Employee[];
  onToggleDayOff: (date: string, employeeId: string, isOff: boolean) => void;
  onUpdateShift?: (
    date: string,
    shiftType: "ca1" | "ca2",
    employeeIds: string[]
  ) => void;
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

export default function WeekScheduleView({
  schedule,
  employees,
  onToggleDayOff,
  onUpdateShift,
}: WeekScheduleViewProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandAll, setExpandAll] = useState(false);
  const [editingShift, setEditingShift] = useState<{
    date: string;
    shift: "ca1" | "ca2";
  } | null>(null);

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "N/A";
  };

  const getEmployeeColor = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.color || "#gray";
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = parseDate(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const toggleDayExpanded = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
    setExpandAll(false);
  };

  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    setExpandedDay(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Lịch làm việc tuần - Chế độ chỉnh sửa
        </h2>
        <button
          onClick={toggleExpandAll}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
        >
          {expandAll ? "Thu gọn tất cả" : "Mở rộng tất cả"}
        </button>
      </div>

      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Hướng dẫn:</strong> Click vào từng ngày để mở rộng và chỉnh
          sửa (đánh dấu nghỉ)
        </p>
      </div>

      <div className="space-y-2">
        {schedule.days.map((day, index) => {
          const isExpanded = expandAll || expandedDay === day.date;
          const hasEmployeeOff = day.dayOff.length > 0;
          const hasEmptyShift = day.shifts.some(
            (s) => s.employees.length === 0
          );

          return (
            <div
              key={day.date}
              className={`border rounded-lg overflow-hidden transition-all ${
                hasEmptyShift
                  ? "border-red-400 bg-red-50"
                  : hasEmployeeOff
                  ? "border-orange-300 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              {/* Header ngày */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleDayExpanded(day.date)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-700">
                    {WEEKDAYS[index]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDateDisplay(day.date)}
                  </span>
                  {hasEmptyShift && (
                    <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-semibold">
                      ⚠️ Thiếu người
                    </span>
                  )}
                  {hasEmployeeOff && !hasEmptyShift && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                      Có người nghỉ
                    </span>
                  )}
                </div>
                <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
              </div>

              {/* Chi tiết ca làm việc */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  {/* Danh sách nghỉ */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Đánh dấu nghỉ:
                    </h4>
                    <div className="flex gap-2">
                      {employees.map((emp) => {
                        const isOff = day.dayOff.includes(emp.id);
                        return (
                          <button
                            key={emp.id}
                            onClick={() =>
                              onToggleDayOff(day.date, emp.id, !isOff)
                            }
                            className={`px-3 py-2 rounded-lg transition ${
                              isOff
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {emp.name} {isOff ? "(Nghỉ)" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Các ca làm việc */}
                  <div className="space-y-3">
                    {day.shifts.map((shift) => {
                      const isEditing =
                        editingShift?.date === day.date &&
                        editingShift?.shift === shift.shiftType;
                      const availableEmployees = employees.filter(
                        (e) => !day.dayOff.includes(e.id)
                      );

                      return (
                        <div
                          key={shift.shiftType}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">
                              {SHIFTS[shift.shiftType].name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {SHIFTS[shift.shiftType].startTime} -{" "}
                                {SHIFTS[shift.shiftType].endTime}
                              </span>
                              {onUpdateShift && (
                                <button
                                  onClick={() =>
                                    setEditingShift(
                                      isEditing
                                        ? null
                                        : {
                                            date: day.date,
                                            shift: shift.shiftType,
                                          }
                                    )
                                  }
                                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                >
                                  {isEditing ? "Đóng" : "Sửa"}
                                </button>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 mb-2">
                                Chọn nhân viên cho ca này (có thể chọn nhiều):
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {availableEmployees.map((emp) => {
                                  const isSelected = shift.employees.includes(
                                    emp.id
                                  );
                                  return (
                                    <button
                                      key={emp.id}
                                      onClick={() => {
                                        const currentEmployees =
                                          shift.employees;
                                        let newEmployees: string[];
                                        if (isSelected) {
                                          // Bỏ chọn
                                          newEmployees =
                                            currentEmployees.filter(
                                              (id) => id !== emp.id
                                            );
                                        } else {
                                          // Thêm vào
                                          newEmployees = [
                                            ...currentEmployees,
                                            emp.id,
                                          ];
                                        }
                                        onUpdateShift?.(
                                          day.date,
                                          shift.shiftType,
                                          newEmployees
                                        );
                                      }}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium transition hover:opacity-80 border-2 ${
                                        isSelected ? "ring-2 ring-offset-1" : ""
                                      }`}
                                      style={{
                                        backgroundColor: isSelected
                                          ? emp.color
                                          : emp.color + "20",
                                        borderColor: emp.color,
                                        color: isSelected ? "#fff" : emp.color,
                                      }}
                                    >
                                      {isSelected ? "✓ " : ""}
                                      {emp.name}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => {
                                    onUpdateShift?.(
                                      day.date,
                                      shift.shiftType,
                                      []
                                    );
                                  }}
                                  className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                >
                                  Bỏ trống
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {shift.employees.length > 0 ? (
                                shift.employees.map((empId) => (
                                  <div
                                    key={empId}
                                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                                    style={{
                                      backgroundColor: getEmployeeColor(empId),
                                    }}
                                  >
                                    {getEmployeeName(empId)}
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border-2 border-red-300 rounded-lg">
                                  <span className="text-red-600 font-semibold">
                                    ⚠️
                                  </span>
                                  <span className="text-sm text-red-700 font-medium">
                                    Thiếu người làm ca này
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
