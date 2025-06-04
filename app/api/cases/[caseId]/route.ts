import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { caseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const caseId = params.caseId;
    console.log("Fetching case:", caseId);
    
    // Fetch the case with related data
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        treatmentNotes: {
          orderBy: { timestamp: "asc" },
        },
        medicalReport: true,
        director: {
          select: {
            name: true,
            email: true,
          },
        },
        paramedic: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    // Check permissions - only allow access to:
    // 1. The assigned paramedic
    // 2. The director who created the case
    // 3. Any medical director
    const isAuthorized = 
      (session.user.role === "PARAMEDIC" && caseData.paramedicId === session.user.id) ||
      (session.user.role === "MEDICAL_DIRECTOR");
      
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You do not have permission to view this case" },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case details" },
      { status: 500 }
    );
  }
}