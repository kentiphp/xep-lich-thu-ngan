"use client";

import { getMonday } from "@/lib/schedule";

interface WeekNavigatorProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
}

export default function WeekNavigator({
  currentWeekStart,
  onWeekChange,
}: WeekNavigatorProps) {
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() - 7);
    onWeekChange(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() + 7);
    onWeekChange(newWeek);
  };

  const goToThisWeek = () => {
    const today = new Date();
    const monday = getMonday(today);
    onWeekChange(monday);
  };

  const getWeekEndDate = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    return weekEnd;
  };

  const formatDateRange = () => {
    const start = currentWeekStart;
    const end = getWeekEndDate();

    return `${start.getDate()}/${
      start.getMonth() + 1
    }/${start.getFullYear()} - ${end.getDate()}/${
      end.getMonth() + 1
    }/${end.getFullYear()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          ← Tuần trước
        </button>

        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            {formatDateRange()}
          </div>
          <button
            onClick={goToThisWeek}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Tuần này
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Tuần sau →
        </button>
      </div>
    </div>
  );
}
