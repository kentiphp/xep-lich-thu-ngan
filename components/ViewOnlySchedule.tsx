"use client";

import { WeekSchedule, Employee, SHIFTS } from "@/types";
import { parseDate } from "@/lib/schedule";

interface ViewOnlyScheduleProps {
  schedule: WeekSchedule;
  employees: Employee[];
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

export default function ViewOnlySchedule({
  schedule,
  employees,
}: ViewOnlyScheduleProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <h2 className="text-2xl font-bold text-white text-center">
          📅 Lịch làm việc tuần
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left font-semibold text-gray-700 min-w-[120px]">
                Ngày
              </th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700 min-w-[200px]">
                Ca 1 (8:30 - 17:00)
              </th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700 min-w-[200px]">
                Ca 2 (14:00 - 23:00)
              </th>
              <th className="border border-gray-300 p-3 text-center font-semibold text-gray-700 min-w-[150px]">
                Nghỉ
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.days.map((day, index) => {
              const ca1 = day.shifts.find((s) => s.shiftType === "ca1");
              const ca2 = day.shifts.find((s) => s.shiftType === "ca2");
              const hasEmployeeOff = day.dayOff.length > 0;
              const hasEmptyShift =
                !ca1?.employees.length || !ca2?.employees.length;

              return (
                <tr
                  key={day.date}
                  className={`${
                    hasEmptyShift
                      ? "bg-red-50"
                      : hasEmployeeOff
                      ? "bg-orange-50"
                      : "hover:bg-gray-50"
                  } transition`}
                >
                  {/* Cột ngày */}
                  <td className="border border-gray-300 p-3">
                    <div className="font-semibold text-gray-800">
                      {WEEKDAYS[index]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDateDisplay(day.date)}
                    </div>
                  </td>

                  {/* Ca 1 */}
                  <td className="border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {ca1?.employees.map((empId) => (
                        <div
                          key={empId}
                          className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: getEmployeeColor(empId) + "20",
                            border: `2px solid ${getEmployeeColor(empId)}`,
                            color: getEmployeeColor(empId),
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getEmployeeColor(empId) }}
                          />
                          {getEmployeeName(empId)}
                        </div>
                      ))}
                      {(!ca1?.employees || ca1.employees.length === 0) && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border-2 border-red-300 rounded-md">
                          <span className="text-red-600 font-semibold">⚠️</span>
                          <span className="text-sm text-red-700 font-medium">
                            Thiếu người
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Ca 2 */}
                  <td className="border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {ca2?.employees.map((empId) => (
                        <div
                          key={empId}
                          className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                          style={{
                            backgroundColor: getEmployeeColor(empId) + "20",
                            border: `2px solid ${getEmployeeColor(empId)}`,
                            color: getEmployeeColor(empId),
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getEmployeeColor(empId) }}
                          />
                          {getEmployeeName(empId)}
                        </div>
                      ))}
                      {(!ca2?.employees || ca2.employees.length === 0) && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border-2 border-red-300 rounded-md">
                          <span className="text-red-600 font-semibold">⚠️</span>
                          <span className="text-sm text-red-700 font-medium">
                            Thiếu người
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Nghỉ */}
                  <td className="border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {day.dayOff.map((empId) => (
                        <div
                          key={empId}
                          className="px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 border-2 border-red-300 flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          {getEmployeeName(empId)}
                        </div>
                      ))}
                      {day.dayOff.length === 0 && (
                        <span className="text-gray-400 text-sm italic">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Ghi chú */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Đang làm việc</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-600">Nghỉ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
