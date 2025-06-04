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

    // Only paramedics can update their location
    if (session.user.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { location, latitude, longitude } = await request.json();

    if (!location || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing location data" },
        { status: 400 }
      );
    }

    // Update the paramedic's location
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { location, latitude, longitude },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}