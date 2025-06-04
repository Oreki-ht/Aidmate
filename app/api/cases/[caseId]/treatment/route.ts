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
    const { content } = await request.json();
    
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Treatment note cannot be empty" },
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
    
    // Only the assigned paramedic can add treatment notes
    if (
      session.user.role === "PARAMEDIC" && 
      caseRecord.paramedicId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "You are not assigned to this case" },
        { status: 403 }
      );
    }
    
    // Create the treatment note
    const treatmentNote = await prisma.treatmentNote.create({
      data: {
        content,
        caseId,
      },
    });
    
    return NextResponse.json({ treatmentNote }, { status: 201 });
  } catch (error) {
    console.error("Error adding treatment note:", error);
    return NextResponse.json(
      { error: "Failed to add treatment note" },
      { status: 500 }
    );
  }
}