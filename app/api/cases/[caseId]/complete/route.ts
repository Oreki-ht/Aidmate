import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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
    const { 
      treatmentSummary, 
      patientStatus, 
      hospitalTransfer, 
      hospitalName, 
      recommendations 
    } = await request.json();
    
    // Validate required fields
    if (!treatmentSummary?.trim() || !patientStatus?.trim() || !recommendations?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // If hospitalTransfer is true, hospitalName is required
    if (hospitalTransfer && !hospitalName?.trim()) {
      return NextResponse.json(
        { error: "Hospital name is required when patient is transferred" },
        { status: 400 }
      );
    }
    
    // Verify that the case exists and is assigned to this paramedic
    const caseRecord = await prisma.case.findUnique({
      where: { id: caseId },
    });
    
    if (!caseRecord) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    // Only the assigned paramedic can complete a case
    if (
      session.user.role === "PARAMEDIC" && 
      caseRecord.paramedicId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You are not assigned to this case" },
        { status: 403 }
      );
    }
    
    // Create the medical report and update case status in a transaction
    const result = await prisma.$transaction([
      prisma.medicalReport.create({
        data: {
          treatmentSummary,
          patientStatus,
          hospitalTransfer,
          hospitalName: hospitalTransfer ? hospitalName : null,
          recommendations,
          caseId,
        },
      }),
      prisma.case.update({
        where: { id: caseId },
        data: { status: "COMPLETED" },
      }),
    ]);
    
    const medicalReport = result[0];
    const updatedCase = result[1];
    
    return NextResponse.json({ medicalReport, case: updatedCase }, { status: 201 });
  } catch (error) {
    console.error("Error completing case:", error);
    return NextResponse.json(
      { error: "Failed to complete case" },
      { status: 500 }
    );
  }
}