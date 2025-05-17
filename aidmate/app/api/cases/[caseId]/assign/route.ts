import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendNotificationToParamedic } from '@/lib/notifications';

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

    // Only directors can assign cases
    if (session.user.role !== "MEDICAL_DIRECTOR") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const caseId = params.caseId;
    const { paramedicId } = await request.json();

    if (!paramedicId) {
      return NextResponse.json(
        { error: "Missing paramedic ID" },
        { status: 400 }
      );
    }

    // Fetch the case details
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    const { latitude: caseLat, longitude: caseLng } = caseData;

    if (caseLat === null || caseLng === null) {
      return NextResponse.json(
        { error: "Case location is incomplete" },
        { status: 400 }
      );
    }

    // Fetch available paramedics
    const paramedics = await prisma.user.findMany({
      where: {
        role: "PARAMEDIC",
        availability: true,
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
      },
    });

    // Calculate distances using the Haversine formula
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRadians(lat2 - lat1);
      const dLng = toRadians(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    const distances = paramedics.map((paramedic) => ({
      ...paramedic,
      distance: calculateDistance(
        caseLat,
        caseLng,
        paramedic.latitude!,
        paramedic.longitude!
      ),
    }));

    // Sort paramedics by proximity
    distances.sort((a, b) => a.distance - b.distance);

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: { 
        paramedicId: paramedicId,
        status: "ASSIGNED"
      },
      include: {
        paramedic: {
          select: {
            name: true,
          },
        },
      }
    });
    
    await sendNotificationToParamedic(paramedicId, caseId, caseData);

    return NextResponse.json({ paramedics: distances, success: true, case: updatedCase });
  } catch (error) {
    console.error("Error assigning case:", error);
    return NextResponse.json(
      { error: "Failed to assign case" },
      { status: 500 }
    );
  }
}