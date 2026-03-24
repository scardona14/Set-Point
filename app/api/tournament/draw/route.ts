import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { players } = body;

    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: "Invalid players array" }, { status: 400 });
    }

    // Mock response generating a bracket from the players
    return NextResponse.json({
      success: true,
      message: "Bracket generated successfully",
      bracket: {
        rounds: [
          {
            title: "Round 1",
            matches: players.map((p, i) => ({
              id: `m${i}`,
              player1: p,
              player2: "TBD",
            })),
          },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
