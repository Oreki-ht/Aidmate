import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Check if users already exist to prevent duplicates
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Database already has users. Skipping seed." 
      });
    }

    // Create a medical director
    const hashedPassword1 = await bcrypt.hash("director123", 10);
    await prisma.user.create({
      data: {
        name: "Dr. Sarah Smith",
        email: "director@aidmate.com",
        password: hashedPassword1,
        role: "MEDICAL_DIRECTOR",
      },
    });

    // Create a paramedic
    const hashedPassword2 = await bcrypt.hash("paramedic123", 10);
    await prisma.user.create({
      data: {
        name: "John Doe",
        email: "paramedic@aidmate.com",
        password: hashedPassword2,
        role: "PARAMEDIC",
      },
    });

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 }
    );
  }
}