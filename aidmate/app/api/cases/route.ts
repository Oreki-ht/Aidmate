import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET all cases (for director)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
        
    const cases = await prisma.case.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        paramedic: {
          select: {
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

// CREATE a new case
// Just the POST part needs to be updated

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only directors can create cases
    if (session.user.role !== "MEDICAL_DIRECTOR") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    const { 
      patientName, 
      patientAge, 
      patientGender, 
      location, 
      latitude, 
      longitude, 
      description, 
      severity, 
      notes 
    } = await request.json();
    
    if (!location || !description || !severity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const newCase = await prisma.case.create({
      data: {
        patientName: patientName || null,
        patientAge: patientAge || null,
        patientGender: patientGender || null,
        location,
        latitude: latitude || null,  
        longitude: longitude || null, 
        description,
        severity,
        notes: notes || null,
        status: "NEW",
        directorId: session.user.id,
      },
    });
    
    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}