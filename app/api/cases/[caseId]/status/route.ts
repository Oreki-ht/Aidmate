import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
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
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: "Missing status" },
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
    
    // Only the assigned paramedic or a director can update the status
    if (
      session.user.role === "PARAMEDIC" && 
      caseRecord.paramedicId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You are not assigned to this case" },
        { status: 403 }
      );
    }
    
    // Update the case status
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { status },
    });
    
    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error("Error updating case status:", error);
    return NextResponse.json(
      { error: "Failed to update case status" },
      { status: 500 }
    );
  }
}