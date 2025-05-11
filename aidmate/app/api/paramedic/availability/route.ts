import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only paramedics can toggle availability
    if (session.user.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { availability } = await request.json();

    // Update the paramedic's availability
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { availability },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error toggling availability:", error);
    return NextResponse.json(
      { error: "Failed to toggle availability" },
      { status: 500 }
    );
  }
}