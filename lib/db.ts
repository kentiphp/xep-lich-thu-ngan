import { sql } from "@vercel/postgres";
import { Employee, EmployeePreferences, WeekSchedule } from "@/types";

// Initialize database tables
export async function initDatabase() {
  try {
    // Create employees table
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        can_work_alone BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS preferences (
        id SERIAL PRIMARY KEY,
        employee_id TEXT NOT NULL,
        day_of_week INTEGER NOT NULL,
        preference TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(employee_id, day_of_week)
      )
    `;

    // Create schedules table
    await sql`
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        week_start TEXT NOT NULL,
        schedule_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week_start)
      )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

// Employees CRUD operations
export async function getEmployees(): Promise<Employee[]> {
  try {
    const { rows } = await sql`SELECT * FROM employees ORDER BY created_at ASC`;
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      canWorkAlone: row.can_work_alone || false,
    }));
  } catch (error) {
    console.error("Error getting employees:", error);
    return [];
  }
}

export async function saveEmployee(employee: Employee): Promise<void> {
  try {
    await sql`
      INSERT INTO employees (id, name, color, can_work_alone)
      VALUES (${employee.id}, ${employee.name}, ${employee.color}, ${
      employee.canWorkAlone || false
    })
      ON CONFLICT (id) 
      DO UPDATE SET name = ${employee.name}, color = ${
      employee.color
    }, can_work_alone = ${employee.canWorkAlone || false}
    `;
  } catch (error) {
    console.error("Error saving employee:", error);
    throw error;
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  try {
    await sql`DELETE FROM employees WHERE id = ${id}`;
    await sql`DELETE FROM preferences WHERE employee_id = ${id}`;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
}

// Preferences operations
export async function getPreferences(): Promise<EmployeePreferences[]> {
  try {
    const { rows } =
      await sql`SELECT * FROM preferences ORDER BY employee_id, day_of_week`;

    const preferencesMap = new Map<string, EmployeePreferences>();

    rows.forEach((row) => {
      const employeeId = row.employee_id;
      if (!preferencesMap.has(employeeId)) {
        preferencesMap.set(employeeId, {
          employeeId,
          preferences: [],
        });
      }

      preferencesMap.get(employeeId)!.preferences.push({
        dayOfWeek: row.day_of_week,
        preference: row.preference as "morning" | "evening" | "any" | "off",
      });
    });

    return Array.from(preferencesMap.values());
  } catch (error) {
    console.error("Error getting preferences:", error);
    return [];
  }
}

export async function savePreferences(
  preferences: EmployeePreferences[]
): Promise<void> {
  try {
    // Delete all existing preferences
    await sql`DELETE FROM preferences`;

    // Insert new preferences
    for (const empPref of preferences) {
      for (const dayPref of empPref.preferences) {
        await sql`
          INSERT INTO preferences (employee_id, day_of_week, preference)
          VALUES (${empPref.employeeId}, ${dayPref.dayOfWeek}, ${dayPref.preference})
          ON CONFLICT (employee_id, day_of_week)
          DO UPDATE SET preference = ${dayPref.preference}
        `;
      }
    }
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
}

// Schedule operations
export async function getSchedule(
  weekStart: string
): Promise<WeekSchedule | null> {
  try {
    const { rows } = await sql`
      SELECT schedule_data FROM schedules WHERE week_start = ${weekStart}
    `;

    if (rows.length === 0) {
      return null;
    }

    return rows[0].schedule_data as WeekSchedule;
  } catch (error) {
    console.error("Error getting schedule:", error);
    return null;
  }
}

export async function saveSchedule(
  weekStart: string,
  schedule: WeekSchedule
): Promise<void> {
  try {
    await sql`
      INSERT INTO schedules (week_start, schedule_data, updated_at)
      VALUES (${weekStart}, ${JSON.stringify(schedule)}, CURRENT_TIMESTAMP)
      ON CONFLICT (week_start)
      DO UPDATE SET schedule_data = ${JSON.stringify(
        schedule
      )}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error("Error saving schedule:", error);
    throw error;
  }
}
