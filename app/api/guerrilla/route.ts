import { NextResponse } from "next/server";

export async function GET() {
  const MOCK_GAMES = [
    {
      id: "g1",
      sport: "Padel",
      locationName: "Miramar Paddle Club",
      distance: "0.8 mi away",
      playersJoined: 3,
      totalSlots: 4,
      timeRemaining: "Starts in 22 min",
    },
    {
      id: "g2",
      sport: "Tennis",
      locationName: "Parque Central",
      distance: "1.5 mi away",
      playersJoined: 2,
      totalSlots: 4,
      timeRemaining: "Starts in 45 min",
    },
  ];

  return NextResponse.json(MOCK_GAMES);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sport, location, type, hostId } = body;

    return NextResponse.json(
      { success: true, message: "Guerrilla game created", data: body },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
