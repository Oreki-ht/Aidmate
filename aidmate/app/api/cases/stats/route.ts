import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only directors should access this endpoint
    if (session.user.role !== "MEDICAL_DIRECTOR") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Get stats counts
    const totalCases = await prisma.case.count();
    
    const newCases = await prisma.case.count({
      where: { status: "NEW" }
    });
    
    const assignedCases = await prisma.case.count({
      where: { status: "ASSIGNED" }
    });
    
    const inProgressCases = await prisma.case.count({
      where: { status: "IN_PROGRESS" }
    });
    
    const completedCases = await prisma.case.count({
      where: { status: "COMPLETED" }
    });
    
    return NextResponse.json({
      totalCases,
      newCases,
      assignedCases,
      inProgressCases,
      completedCases
    });
  } catch (error) {
    console.error("Error fetching case stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch case statistics" },
      { status: 500 }
    );
  }
}
