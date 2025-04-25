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
    
    // Only paramedics can access this endpoint
    if (session.user.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }
    
    // Get cases assigned to this paramedic
    const cases = await prisma.case.findMany({
      where: {
        paramedicId: session.user.id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"]
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Error fetching paramedic cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}