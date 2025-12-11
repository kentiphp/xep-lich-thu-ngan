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
  { id: "1", name: "Nhân viên 1", color: "#3b82f6", canWorkAlone: true },
  { id: "2", name: "Nhân viên 2", color: "#10b981", canWorkAlone: false },
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

  // Xếp lịch cho 2 ca
  let assignedShifts = assignEmployeesToBothShifts(
    availableEmployees,
    dayOfWeek,
    preferences
  );

  // TRƯỜNG HỢP ĐẶC BIỆT: Thiếu người và chỉ còn 1 người đủ điều kiện
  // Nếu 1 ca thiếu người và chỉ có 1 người đủ điều kiện, người đó phải làm full 2 ca
  const qualifiedEmployees = availableEmployees.filter((e) => e.canWorkAlone);
  
  if (qualifiedEmployees.length === 1 && 
      (assignedShifts.ca1.length === 0 || assignedShifts.ca2.length === 0)) {
    const qualifiedId = qualifiedEmployees[0].id;
    // Nếu 1 trong 2 ca thiếu người đủ điều kiện, bắt người đủ điều kiện làm full
    assignedShifts = {
      ca1: [qualifiedId],
      ca2: [qualifiedId],
    };
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
// QUY TẮC:
// 1. Mỗi ca ít nhất 1 người
// 2. Mỗi nhân viên làm 1 ca/ngày (trừ khi thiếu người)
// 3. Nhân viên chưa đủ điều kiện phải làm chung với nhân viên đủ điều kiện
// 4. Nếu chỉ còn 1 người đủ điều kiện và thiếu người → Người đó làm full 2 ca
const assignEmployeesToBothShifts = (
  availableEmployees: Employee[],
  dayOfWeek?: number,
  preferences?: EmployeePreferences[]
): { ca1: string[]; ca2: string[] } => {
  if (availableEmployees.length === 0) {
    return { ca1: [], ca2: [] };
  }

  // Phân loại nhân viên theo khả năng
  const canWorkAlone = availableEmployees.filter((e) => e.canWorkAlone);
  const needSupervision = availableEmployees.filter((e) => !e.canWorkAlone);

  const ca1Employees: string[] = [];
  const ca2Employees: string[] = [];
  const usedEmployeeIds = new Set<string>();

  // Hàm helper: Lấy preference của nhân viên cho ngày này
  const getPreference = (empId: string): string => {
    if (!preferences || dayOfWeek === undefined) return "any";
    const empPref = preferences.find((p) => p.employeeId === empId);
    const dayPref = empPref?.preferences.find((p) => p.dayOfWeek === dayOfWeek);
    return dayPref?.preference || "any";
  };

  // Phân loại theo preference
  const canAloneMorning = canWorkAlone.filter(
    (e) => getPreference(e.id) === "morning"
  );
  const canAloneEvening = canWorkAlone.filter(
    (e) => getPreference(e.id) === "evening"
  );
  const canAloneFlexible = canWorkAlone.filter(
    (e) => getPreference(e.id) === "any"
  );

  const needSupMorning = needSupervision.filter(
    (e) => getPreference(e.id) === "morning"
  );
  const needSupEvening = needSupervision.filter(
    (e) => getPreference(e.id) === "evening"
  );
  const needSupFlexible = needSupervision.filter(
    (e) => getPreference(e.id) === "any"
  );

  // BƯỚC 1: Xếp Ca 1 (Sáng)
  // Ưu tiên: người đủ điều kiện + muốn ca sáng
  let ca1Qualified: Employee | null = null;

  if (canAloneMorning.length > 0) {
    ca1Qualified = canAloneMorning[0];
  } else if (canAloneFlexible.length > 0) {
    ca1Qualified = canAloneFlexible[0];
  } else if (canAloneEvening.length > 0) {
    ca1Qualified = canAloneEvening[0];
  }

  if (ca1Qualified) {
    ca1Employees.push(ca1Qualified.id);
    usedEmployeeIds.add(ca1Qualified.id);

    // Nếu có người chưa đủ điều kiện + muốn ca sáng, ghép cặp
    if (needSupMorning.length > 0) {
      ca1Employees.push(needSupMorning[0].id);
      usedEmployeeIds.add(needSupMorning[0].id);
    } else if (needSupFlexible.length > 0) {
      ca1Employees.push(needSupFlexible[0].id);
      usedEmployeeIds.add(needSupFlexible[0].id);
    }
  } else {
    // Không có người đủ điều kiện, phải ghép 2 người chưa đủ điều kiện
    if (needSupMorning.length > 0) {
      ca1Employees.push(needSupMorning[0].id);
      usedEmployeeIds.add(needSupMorning[0].id);
    } else if (needSupFlexible.length > 0) {
      ca1Employees.push(needSupFlexible[0].id);
      usedEmployeeIds.add(needSupFlexible[0].id);
    } else if (needSupEvening.length > 0) {
      ca1Employees.push(needSupEvening[0].id);
      usedEmployeeIds.add(needSupEvening[0].id);
    }

    // Thêm người thứ 2 nếu có
    const remaining = needSupervision.filter((e) => !usedEmployeeIds.has(e.id));
    if (ca1Employees.length === 1 && remaining.length > 0) {
      ca1Employees.push(remaining[0].id);
      usedEmployeeIds.add(remaining[0].id);
    }
  }

  // BƯỚC 2: Xếp Ca 2 (Tối)
  // Lấy danh sách người còn lại
  const remainingCanAlone = canWorkAlone.filter(
    (e) => !usedEmployeeIds.has(e.id)
  );
  const remainingNeedSup = needSupervision.filter(
    (e) => !usedEmployeeIds.has(e.id)
  );

  let ca2Qualified: Employee | null = null;

  // Ưu tiên người đủ điều kiện + muốn ca tối
  const remainingCanAloneEvening = remainingCanAlone.filter(
    (e) => getPreference(e.id) === "evening"
  );
  const remainingCanAloneFlexible = remainingCanAlone.filter(
    (e) => getPreference(e.id) === "any"
  );
  const remainingCanAloneMorning = remainingCanAlone.filter(
    (e) => getPreference(e.id) === "morning"
  );

  if (remainingCanAloneEvening.length > 0) {
    ca2Qualified = remainingCanAloneEvening[0];
  } else if (remainingCanAloneFlexible.length > 0) {
    ca2Qualified = remainingCanAloneFlexible[0];
  } else if (remainingCanAloneMorning.length > 0) {
    ca2Qualified = remainingCanAloneMorning[0];
  }

  if (ca2Qualified) {
    ca2Employees.push(ca2Qualified.id);
    usedEmployeeIds.add(ca2Qualified.id);

    // Ghép với người chưa đủ điều kiện nếu có
    const remainingNeedSupEvening = remainingNeedSup.filter(
      (e) => getPreference(e.id) === "evening"
    );
    const remainingNeedSupFlexible = remainingNeedSup.filter(
      (e) => getPreference(e.id) === "any"
    );

    if (remainingNeedSupEvening.length > 0) {
      ca2Employees.push(remainingNeedSupEvening[0].id);
      usedEmployeeIds.add(remainingNeedSupEvening[0].id);
    } else if (remainingNeedSupFlexible.length > 0) {
      ca2Employees.push(remainingNeedSupFlexible[0].id);
      usedEmployeeIds.add(remainingNeedSupFlexible[0].id);
    }
  } else {
    // Không có người đủ điều kiện, xếp người chưa đủ điều kiện
    const remainingNeedSupEvening = remainingNeedSup.filter(
      (e) => getPreference(e.id) === "evening"
    );
    const remainingNeedSupFlexible = remainingNeedSup.filter(
      (e) => getPreference(e.id) === "any"
    );
    const remainingNeedSupMorning = remainingNeedSup.filter(
      (e) => getPreference(e.id) === "morning"
    );

    if (remainingNeedSupEvening.length > 0) {
      ca2Employees.push(remainingNeedSupEvening[0].id);
      usedEmployeeIds.add(remainingNeedSupEvening[0].id);
    } else if (remainingNeedSupFlexible.length > 0) {
      ca2Employees.push(remainingNeedSupFlexible[0].id);
      usedEmployeeIds.add(remainingNeedSupFlexible[0].id);
    } else if (remainingNeedSupMorning.length > 0) {
      ca2Employees.push(remainingNeedSupMorning[0].id);
      usedEmployeeIds.add(remainingNeedSupMorning[0].id);
    }

    // Thêm người thứ 2 nếu cần
    const stillRemaining = remainingNeedSup.filter(
      (e) => !usedEmployeeIds.has(e.id)
    );
    if (ca2Employees.length === 1 && stillRemaining.length > 0) {
      ca2Employees.push(stillRemaining[0].id);
      usedEmployeeIds.add(stillRemaining[0].id);
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
