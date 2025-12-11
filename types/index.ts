// Định nghĩa loại ca làm việc
export type ShiftType = "ca1" | "ca2";

// Thông tin ca làm việc
export interface ShiftInfo {
  name: string;
  startTime: string;
  endTime: string;
}

// Cấu hình ca làm việc
export const SHIFTS: Record<ShiftType, ShiftInfo> = {
  ca1: {
    name: "Ca 1",
    startTime: "08:30",
    endTime: "17:00",
  },
  ca2: {
    name: "Ca 2",
    startTime: "14:00",
    endTime: "23:00",
  },
};

// Nhân viên
export interface Employee {
  id: string;
  name: string;
  color: string; // màu hiển thị trên lịch
  canWorkAlone?: boolean; // nhân viên đủ điều kiện đứng 1 mình 1 ca
}

// Lịch làm việc của một ca
export interface ShiftAssignment {
  shiftType: ShiftType;
  employees: string[]; // danh sách ID nhân viên (1-2 người)
}

// Lịch làm việc của một ngày
export interface DaySchedule {
  date: string; // format: YYYY-MM-DD
  shifts: ShiftAssignment[];
  dayOff: string[]; // danh sách ID nhân viên nghỉ trong ngày
}

// Lịch làm việc tuần
export interface WeekSchedule {
  weekStart: string; // ngày đầu tuần (Monday)
  days: DaySchedule[];
}

// Loại yêu cầu ca làm việc
export type ShiftPreferenceType = "morning" | "evening" | "off" | "any";

// Yêu cầu ca làm việc của nhân viên cho một ngày
export interface DayPreference {
  dayOfWeek: number; // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  preference: ShiftPreferenceType;
}

// Yêu cầu ca làm việc của nhân viên
export interface EmployeePreferences {
  employeeId: string;
  preferences: DayPreference[];
}
