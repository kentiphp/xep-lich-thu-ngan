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

  // KIỂM TRA VÀ SỬA CÁC TRƯỜNG HỢP VI PHẠM QUY TẮC
  const qualifiedEmployees = availableEmployees.filter((e) => e.canWorkAlone);
  const unqualifiedEmployees = availableEmployees.filter(
    (e) => !e.canWorkAlone
  );

  // Hàm kiểm tra xem ca có hợp lệ không
  const isShiftValid = (shiftEmployees: string[]): boolean => {
    if (shiftEmployees.length === 0) return false; // Ca trống

    // Nếu ca chỉ có 1 người
    if (shiftEmployees.length === 1) {
      const emp = availableEmployees.find((e) => e.id === shiftEmployees[0]);
      // Người đó phải đủ điều kiện
      return emp?.canWorkAlone === true;
    }

    // Nếu ca có 2+ người
    if (shiftEmployees.length >= 2) {
      // Phải có ít nhất 1 người đủ điều kiện
      return shiftEmployees.some((id) => {
        const emp = availableEmployees.find((e) => e.id === id);
        return emp?.canWorkAlone === true;
      });
    }

    return true;
  };

  const ca1Valid = isShiftValid(assignedShifts.ca1);
  const ca2Valid = isShiftValid(assignedShifts.ca2);

  // Nếu cả 2 ca đều hợp lệ → OK
  if (ca1Valid && ca2Valid) {
    // Không làm gì
  }
  // Nếu có ca không hợp lệ và chỉ có 1 người đủ điều kiện
  else if (qualifiedEmployees.length === 1 && (!ca1Valid || !ca2Valid)) {
    const qualifiedId = qualifiedEmployees[0].id;
    // Người đủ điều kiện phải làm full 2 ca
    assignedShifts = {
      ca1: [qualifiedId],
      ca2: [qualifiedId],
    };
  }
  // Nếu có nhiều người đủ điều kiện nhưng ca không hợp lệ
  else if (qualifiedEmployees.length >= 2) {
    // Ca 1 không hợp lệ
    if (!ca1Valid) {
      if (assignedShifts.ca1.length === 0) {
        // Ca trống → Thêm người đủ điều kiện chưa làm
        const availableQualified = qualifiedEmployees.find(
          (e) => !assignedShifts.ca2.includes(e.id)
        );
        if (availableQualified) {
          assignedShifts.ca1 = [availableQualified.id];
        } else {
          // Tất cả người đủ DK đã làm ca 2 → Lấy 1 người làm full
          assignedShifts.ca1 = [qualifiedEmployees[0].id];
        }
      } else {
        // Ca có người nhưng không có người đủ DK → Thêm người đủ DK
        const availableQualified = qualifiedEmployees.find(
          (e) =>
            !assignedShifts.ca1.includes(e.id) &&
            !assignedShifts.ca2.includes(e.id)
        );
        if (availableQualified) {
          assignedShifts.ca1.push(availableQualified.id);
        } else {
          // Không còn người đủ DK → Lấy người đã làm ca 2
          const qualifiedInCa2 = qualifiedEmployees.find((e) =>
            assignedShifts.ca2.includes(e.id)
          );
          if (qualifiedInCa2) {
            assignedShifts.ca1.push(qualifiedInCa2.id);
          }
        }
      }
    }

    // Ca 2 không hợp lệ
    if (!ca2Valid) {
      if (assignedShifts.ca2.length === 0) {
        // Ca trống → Thêm người đủ điều kiện chưa làm
        const availableQualified = qualifiedEmployees.find(
          (e) => !assignedShifts.ca1.includes(e.id)
        );
        if (availableQualified) {
          assignedShifts.ca2 = [availableQualified.id];
        } else {
          // Tất cả người đủ DK đã làm ca 1 → Lấy 1 người làm full
          assignedShifts.ca2 = [qualifiedEmployees[0].id];
        }
      } else {
        // Ca có người nhưng không có người đủ DK → Thêm người đủ DK
        const availableQualified = qualifiedEmployees.find(
          (e) =>
            !assignedShifts.ca1.includes(e.id) &&
            !assignedShifts.ca2.includes(e.id)
        );
        if (availableQualified) {
          assignedShifts.ca2.push(availableQualified.id);
        } else {
          // Không còn người đủ DK → Lấy người đã làm ca 1
          const qualifiedInCa1 = qualifiedEmployees.find((e) =>
            assignedShifts.ca1.includes(e.id)
          );
          if (qualifiedInCa1) {
            assignedShifts.ca2.push(qualifiedInCa1.id);
          }
        }
      }
    }
  }
  // Trường hợp không có người đủ điều kiện
  else if (qualifiedEmployees.length === 0) {
    // Ghép tất cả người chưa đủ DK vào cả 2 ca
    if (unqualifiedEmployees.length >= 2) {
      assignedShifts = {
        ca1: [unqualifiedEmployees[0].id, unqualifiedEmployees[1].id],
        ca2: unqualifiedEmployees.slice(1).map((e) => e.id),
      };
    } else if (unqualifiedEmployees.length === 1) {
      // Chỉ có 1 người chưa đủ DK → Không thể xếp ca hợp lệ
      assignedShifts = {
        ca1: [unqualifiedEmployees[0].id],
        ca2: [],
      };
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
// QUY TẮC QUAN TRỌNG:
// 1. Mỗi ca ít nhất 1 người
// 2. Người CHƯA đủ điều kiện KHÔNG BAO GIỜ đứng ca một mình
// 3. Nếu ca chỉ có 1 người → Người đó PHẢI đủ điều kiện
// 4. Nếu ca có 2+ người → Phải có ít nhất 1 người đủ điều kiện
// 5. Nếu thiếu người và người đủ DK đã làm ca 1 → Làm full cả 2 ca
// 6. Ưu tiên theo preference (morning/evening/any)
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
