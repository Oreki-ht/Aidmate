import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: Request,
  { params }: { params: { caseId: string } } // Note: This should match the folder name
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only directors can assign cases
    if (session.user.role !== "MEDICAL_DIRECTOR") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const caseId = params.caseId; // Changed from params.id
    console.log("Assigning case:", caseId);
    
    const { paramedicId } = await request.json();
    console.log("To paramedic:", paramedicId);
    
    if (!paramedicId) {
      return NextResponse.json(
        { error: "Missing paramedic ID" },
        { status: 400 }
      );
    }
    
    // Check if the case exists
    const existingCase = await prisma.case.findUnique({
      where: { id: caseId },
    });
    
    if (!existingCase) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }
    
    // Check if the paramedic exists and has the right role
    const paramedic = await prisma.user.findUnique({
      where: { id: paramedicId },
    });
    
    if (!paramedic || paramedic.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Invalid paramedic ID or user is not a paramedic" },
        { status: 400 }
      );
    }
    
    // Update the case - Note: case is lowercase in the Prisma client
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        paramedicId,
        status: "ASSIGNED",
      },
    });
    
    console.log("Case updated successfully:", updatedCase);
    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error("Error assigning case:", error);
    return NextResponse.json(
      { error: "Failed to assign case" },
      { status: 500 }
    );
  }
}