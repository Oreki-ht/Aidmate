import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only paramedics can subscribe to notifications
    if (session.user.role !== "PARAMEDIC") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const subscription = await request.json();

    // Store subscription in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pushSubscription: JSON.stringify(subscription)
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to notifications" },
      { status: 500 }
    );
  }
}