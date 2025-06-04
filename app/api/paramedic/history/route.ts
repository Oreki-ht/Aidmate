import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Only paramedics can access this endpoint
    if (session.user.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Get URL search parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const period = url.searchParams.get('period');
    
    // Build the where clause
    let whereClause: any = {
      paramedicId: session.user.id,
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // Add date filter if provided
    if (period) {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      whereClause.createdAt = {
        gte: startDate
      };
    }
    
    // Get cases assigned to this paramedic (all statuses)
    const cases = await prisma.case.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        medicalReport: {
          select: {
            id: true,
            patientStatus: true,
            hospitalTransfer: true,
            createdAt: true,
          },
        },
        treatmentNotes: {
          select: {
            id: true,
          },
          take: 1, // Just to check if there are any notes
        },
        director: {
          select: {
            name: true,
          },
        }
      },
    });
    
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching paramedic case history:", error);
    return NextResponse.json(
      { error: "Failed to fetch case history" },
      { status: 500 }
    );
  }
}