import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const players: string[] = body.players || [];
    const numCourts: number = Number(body.courts) || 1;
    const category: string = body.category || "Open";

    if (!players || players.length === 0) {
      return NextResponse.json({ error: "No players provided" }, { status: 400 });
    }

    // 1. Calculate Bracket Logic (Power of 2)
    const numPlayers = players.length;
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(numPlayers || 1)));
    const numByes = numPlayers === 1 ? 0 : nextPow2 - numPlayers;

    // 2. Assign Byes (Top seeds get these)
    const byes = players.slice(0, numByes);
    const activePlayers = players.slice(numByes);

    // 3. Generate Round 1 Matches
    const matches = [];
    for (let i = 0; i < activePlayers.length; i += 2) {
      const p1 = activePlayers[i];
      const p2 = i + 1 < activePlayers.length ? activePlayers[i + 1] : null;
      matches.push({
        id: `r1-m${matches.length + 1}`,
        p1,
        p2,
        status: "scheduled",
        court: null as string | null,
      });
    }

    // 4. Court Allocation (The "San Juan Queue")
    // Only assign courts to the first 'n' matches based on court availability
    const numLiveCourts = Math.min(matches.length, Math.floor(numCourts));
    for (let i = 0; i < numLiveCourts; i++) {
      matches[i].status = "live";
      matches[i].court = `Court ${i + 1}`;
    }

    const waitingList = matches.length > numLiveCourts ? matches.slice(numLiveCourts) : [];

    const responseData = {
      category,
      total_players: numPlayers,
      byes_count: numByes,
      byes_list: byes,
      round_1_matches: matches.slice(0, numLiveCourts),
      waiting_list: waitingList,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Tournament API Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

