import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    // Check if can_work_alone column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      AND column_name = 'can_work_alone'
    `;

    if (checkColumn.rows.length === 0) {
      // Add can_work_alone column
      await sql`
        ALTER TABLE employees 
        ADD COLUMN can_work_alone BOOLEAN DEFAULT FALSE
      `;
      console.log("Added can_work_alone column");
    }

    // Check if is_backup column exists
    const checkOldColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'employees' 
      AND column_name = 'is_backup'
    `;

    if (checkOldColumn.rows.length > 0) {
      // Migrate data from is_backup to can_work_alone
      await sql`
        UPDATE employees 
        SET can_work_alone = NOT is_backup
        WHERE is_backup IS NOT NULL
      `;

      // Drop old column
      await sql`
        ALTER TABLE employees 
        DROP COLUMN is_backup
      `;
      console.log("Migrated and dropped is_backup column");
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
