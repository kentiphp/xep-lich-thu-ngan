import {
  Employee,
  DaySchedule,
  ShiftAssignment,
  ShiftType,
  WeekSchedule,
  EmployeePreferences,
} from "@/types";

// Lấy danh sách nhân viên mặc định
export const getDefaultEmployees = (): Employee[] => [
  { id: "1", name: "Nhân viên 1", color: "#3b82f6" },
  { id: "2", name: "Nhân viên 2", color: "#10b981" },
];

// Lấy ngày đầu tuần (thứ 2)
export const getMonday = (date: Date): Date => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Format ngày thành YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Parse ngày từ string
export const parseDate = (dateStr: string): Date => {
  return new Date(dateStr + "T00:00:00");
};

// Tạo lịch làm việc cho một tuần
export const generateWeekSchedule = (
  weekStart: Date,
  employees: Employee[],
  existingSchedule?: WeekSchedule,
  preferences?: EmployeePreferences[]
): WeekSchedule => {
  const days: DaySchedule[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    const dateStr = formatDate(currentDate);

    // Kiểm tra xem đã có lịch cho ngày này chưa
    const existingDay = existingSchedule?.days.find((d) => d.date === dateStr);

    if (existingDay) {
      days.push(existingDay);
    } else {
      // Tạo lịch mới cho ngày này dựa trên preferences
      const daySchedule = generateDaySchedule(
        dateStr,
        employees,
        [],
        i,
        preferences
      );
      days.push(daySchedule);
    }
  }

  return {
    weekStart: formatDate(weekStart),
    days,
  };
};

// Tạo lịch làm việc cho một ngày
export const generateDaySchedule = (
  date: string,
  employees: Employee[],
  dayOff: string[],
  dayOfWeek?: number,
  preferences?: EmployeePreferences[]
): DaySchedule => {
  // Xử lý yêu cầu nghỉ từ preferences
  if (preferences && dayOfWeek !== undefined) {
    const autoOffEmployees = employees.filter((emp) => {
      const empPref = preferences.find((p) => p.employeeId === emp.id);
      const dayPref = empPref?.preferences.find(
        (p) => p.dayOfWeek === dayOfWeek
      );
      return dayPref?.preference === "off";
    });

    // Thêm nhân viên yêu cầu nghỉ vào dayOff nếu chưa có
    autoOffEmployees.forEach((emp) => {
      if (!dayOff.includes(emp.id)) {
        dayOff.push(emp.id);
      }
    });
  }

  const availableEmployees = employees.filter((e) => !dayOff.includes(e.id));
  const hasEmployeeOff = dayOff.length > 0;

  // Xếp lịch cho 2 ca
  let assignedShifts = assignEmployeesToBothShifts(
    availableEmployees,
    dayOfWeek,
    preferences
  );

  // TRƯỜNG HỢP ĐẶC BIỆT: Có người nghỉ và thiếu người
  // Nếu 1 ca thiếu người (length = 0), buộc người còn lại phải làm full
  if (hasEmployeeOff) {
    const regularEmployees = availableEmployees.filter((e) => !e.isBackup);

    // Nếu chỉ còn 1 nhân viên thường và 1 trong 2 ca thiếu người
    if (regularEmployees.length === 1) {
      const employeeId = regularEmployees[0].id;
      assignedShifts = {
        ca1: [employeeId],
        ca2: [employeeId],
      };
    }
    // Nếu cả 2 ca đều thiếu người (không có nhân viên thường)
    else if (
      assignedShifts.ca1.length === 0 ||
      assignedShifts.ca2.length === 0
    ) {
      // Nếu có nhân viên backup và 1 ca thiếu người, bắt backup làm full
      const backupEmployees = availableEmployees.filter((e) => e.isBackup);
      if (backupEmployees.length === 1 && regularEmployees.length === 0) {
        const employeeId = backupEmployees[0].id;
        assignedShifts = {
          ca1: [employeeId],
          ca2: [employeeId],
        };
      }
    }
  }

  const shifts: ShiftAssignment[] = [
    {
      shiftType: "ca1",
      employees: assignedShifts.ca1,
    },
    {
      shiftType: "ca2",
      employees: assignedShifts.ca2,
    },
  ];

  return {
    date,
    shifts,
    dayOff,
  };
};

// Xếp nhân viên cho cả 2 ca cùng lúc
// QUY TẮC MỚI:
// 1. Mỗi ca ít nhất 1 người
// 2. Mỗi nhân viên làm 1 ca/ngày (trừ trường hợp thiếu người do nghỉ)
// 3. Nhân viên trám ca chỉ điền vào ca thiếu người
const assignEmployeesToBothShifts = (
  availableEmployees: Employee[],
  dayOfWeek?: number,
  preferences?: EmployeePreferences[]
): { ca1: string[]; ca2: string[] } => {
  if (availableEmployees.length === 0) {
    return { ca1: [], ca2: [] };
  }

  // Tách nhân viên backup và nhân viên thường
  const backupEmployees = availableEmployees.filter((e) => e.isBackup);
  const regularEmployees = availableEmployees.filter((e) => !e.isBackup);

  const ca1Employees: string[] = [];
  const ca2Employees: string[] = [];
  const usedEmployeeIds = new Set<string>();

  // BƯỚC 1: Phân loại nhân viên thường theo preferences
  const morningPreferred: Employee[] = [];
  const eveningPreferred: Employee[] = [];
  const flexibleEmployees: Employee[] = [];

  regularEmployees.forEach((emp) => {
    if (preferences && dayOfWeek !== undefined) {
      const empPref = preferences.find((p) => p.employeeId === emp.id);
      const dayPref = empPref?.preferences.find(
        (p) => p.dayOfWeek === dayOfWeek
      );

      if (dayPref?.preference === "morning") {
        morningPreferred.push(emp);
      } else if (dayPref?.preference === "evening") {
        eveningPreferred.push(emp);
      } else {
        flexibleEmployees.push(emp);
      }
    } else {
      flexibleEmployees.push(emp);
    }
  });

  // BƯỚC 2: Xếp Ca 1 (Sáng)
  // Ưu tiên: người muốn ca sáng > flexible
  if (morningPreferred.length > 0) {
    ca1Employees.push(morningPreferred[0].id);
    usedEmployeeIds.add(morningPreferred[0].id);
  } else if (flexibleEmployees.length > 0) {
    ca1Employees.push(flexibleEmployees[0].id);
    usedEmployeeIds.add(flexibleEmployees[0].id);
  }

  // BƯỚC 3: Xếp Ca 2 (Tối)
  // Ưu tiên: người muốn ca tối > người muốn ca sáng còn lại > flexible còn lại

  // 3a. Thử người muốn ca tối trước
  const availableEveningPref = eveningPreferred.filter(
    (e) => !usedEmployeeIds.has(e.id)
  );
  if (availableEveningPref.length > 0) {
    ca2Employees.push(availableEveningPref[0].id);
    usedEmployeeIds.add(availableEveningPref[0].id);
  } else {
    // 3b. Thử người muốn ca sáng còn lại
    const availableMorningPref = morningPreferred.filter(
      (e) => !usedEmployeeIds.has(e.id)
    );
    if (availableMorningPref.length > 0) {
      ca2Employees.push(availableMorningPref[0].id);
      usedEmployeeIds.add(availableMorningPref[0].id);
    } else {
      // 3c. Thử flexible còn lại
      const availableFlexible = flexibleEmployees.filter(
        (e) => !usedEmployeeIds.has(e.id)
      );
      if (availableFlexible.length > 0) {
        ca2Employees.push(availableFlexible[0].id);
        usedEmployeeIds.add(availableFlexible[0].id);
      }
    }
  }

  // BƯỚC 4: Kiểm tra và điền nhân viên trám ca nếu thiếu
  // Ca 1 thiếu người
  if (ca1Employees.length === 0 && backupEmployees.length > 0) {
    const availableBackup = backupEmployees.find(
      (e) => !usedEmployeeIds.has(e.id)
    );
    if (availableBackup) {
      ca1Employees.push(availableBackup.id);
      usedEmployeeIds.add(availableBackup.id);
    }
  }

  // Ca 2 thiếu người
  if (ca2Employees.length === 0 && backupEmployees.length > 0) {
    const availableBackup = backupEmployees.find(
      (e) => !usedEmployeeIds.has(e.id)
    );
    if (availableBackup) {
      ca2Employees.push(availableBackup.id);
      usedEmployeeIds.add(availableBackup.id);
    }
  }

  return { ca1: ca1Employees, ca2: ca2Employees };
};

// Cập nhật ngày nghỉ và tự động điều chỉnh lịch
export const updateDayOff = (
  schedule: WeekSchedule,
  date: string,
  employeeId: string,
  isOff: boolean,
  employees: Employee[],
  preferences?: EmployeePreferences[]
): WeekSchedule => {
  const updatedDays = schedule.days.map((day, index) => {
    if (day.date === date) {
      let newDayOff = [...day.dayOff];

      if (isOff && !newDayOff.includes(employeeId)) {
        newDayOff.push(employeeId);
      } else if (!isOff && newDayOff.includes(employeeId)) {
        newDayOff = newDayOff.filter((id) => id !== employeeId);
      }

      // Tạo lại lịch cho ngày này với danh sách nghỉ mới
      return generateDaySchedule(
        date,
        employees,
        newDayOff,
        index,
        preferences
      );
    }
    return day;
  });

  return {
    ...schedule,
    days: updatedDays,
  };
};

// Cập nhật nhân viên trong một ca cụ thể
export const updateShiftAssignment = (
  schedule: WeekSchedule,
  date: string,
  shiftType: ShiftType,
  employeeIds: string[]
): WeekSchedule => {
  const updatedDays = schedule.days.map((day) => {
    if (day.date === date) {
      const updatedShifts = day.shifts.map((shift) => {
        if (shift.shiftType === shiftType) {
          return {
            ...shift,
            employees: employeeIds,
          };
        }
        return shift;
      });

      return {
        ...day,
        shifts: updatedShifts,
      };
    }
    return day;
  });

  return {
    ...schedule,
    days: updatedDays,
  };
};
