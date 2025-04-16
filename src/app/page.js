'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    const res = await fetch('/api/token', {
      method: 'POST',
      body: JSON.stringify({ roomName: room, identity: name }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    const token = data.token;

    // Chuyển sang trang room, gửi token bằng query param
    router.push(`/room?token=${token}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Join a Video Room</h1>
      <input
        placeholder="Your Name"
        className="p-2 border"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Room Name"
        className="p-2 border"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button className="p-2 bg-blue-500 text-white" onClick={handleJoin}>
        Join Room
      </button>
    </div>
  );
}
