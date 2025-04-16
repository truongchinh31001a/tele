import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const SECRET = process.env.LIVEKIT_SECRET;

export async function POST(req) {
    const { roomName, identity } = await req.json();

    const at = new AccessToken(API_KEY, SECRET, { identity });
    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    return NextResponse.json({ token });
}
