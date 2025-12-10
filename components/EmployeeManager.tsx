"use client";

import { Employee } from "@/types";
import { useState } from "react";

interface EmployeeManagerProps {
  employees: Employee[];
  onUpdateEmployees: (employees: Employee[]) => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function EmployeeManager({
  employees,
  onUpdateEmployees,
}: EmployeeManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setEditName(employee.name);
  };

  const handleSave = (id: string) => {
    if (editName.trim()) {
      const updated = employees.map((emp) =>
        emp.id === id ? { ...emp, name: editName.trim() } : emp
      );
      onUpdateEmployees(updated);
    }
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleAddEmployee = () => {
    if (newName.trim()) {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: newName.trim(),
        color: newColor,
      };
      onUpdateEmployees([...employees, newEmployee]);
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setIsAdding(false);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      onUpdateEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
        >
          {isAdding ? "Hủy" : "+ Thêm nhân viên"}
        </button>
      </div>

      {/* Form thêm nhân viên */}
      {isAdding && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">
            Thêm nhân viên mới
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhân viên:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nhập tên nhân viên"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddEmployee();
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn màu:
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-10 h-10 rounded-full transition ${
                      newColor === color
                        ? "ring-4 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAddEmployee}
              disabled={!newName.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Thêm nhân viên
            </button>
          </div>
        </div>
      )}

      {/* Danh sách nhân viên */}
      <div className="space-y-3">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: employee.color }}
              />
              {editingId === employee.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-1 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(employee.id);
                    if (e.key === "Escape") handleCancel();
                  }}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">
                    {employee.name}
                  </span>
                  {employee.isBackup && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full font-medium">
                      🔧 Trám ca
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {editingId === employee.id ? (
                <>
                  <button
                    onClick={() => handleSave(employee.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded cursor-pointer hover:bg-orange-100 transition">
                    <input
                      type="checkbox"
                      checked={employee.isBackup || false}
                      onChange={(e) => {
                        const updated = employees.map((emp) =>
                          emp.id === employee.id
                            ? { ...emp, isBackup: e.target.checked }
                            : emp
                        );
                        onUpdateEmployees(updated);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-orange-700 font-medium">
                      Trám ca
                    </span>
                  </label>
                  <button
                    onClick={() => handleEdit(employee)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
