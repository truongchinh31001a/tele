'use client';

import {
    LiveKitRoom,
    VideoConference,
    useParticipants,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ParticipantList() {
    const participants = useParticipants();

    console.log('Participants:', participants); // Kiểm tra danh sách người tham gia

    return (
        <div className="text-white mb-4">
            <h2 className="font-bold">👥 Participants ({participants.length}):</h2>
            <ul>
                {[...participants].map((p) => (
                    <li key={p.sid}>{p.identity}</li>
                ))}
            </ul>
        </div>
    );
}

export default function RoomPage() {
    const params = useSearchParams();
    const token = params.get('token');
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    const [roomName, setRoomName] = useState('');
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        if (token) {
            // Đây là nơi bạn sẽ kết nối đến room nếu có token
            console.log('Token received:', token);
        }
    }, [token]);

    // Kiểm tra các track video/audio có sẵn
    const handleTrackSubscribed = (track) => {
        console.log('Track added:', track);
        setTracks((prevTracks) => [...prevTracks, track]);
    };

    const handleRoomConnected = (room) => {
        console.log('Connected to room:', room.name);
        setRoomName(room.name); // Lưu tên phòng
    };

    if (!token) {
        console.log('No token, waiting...');
        return <div>Loading...</div>;
    }

    return (
        <LiveKitRoom
            token={token}
            serverUrl={serverUrl}
            connect={true}
            audio={true}
            video={true}
            onRoomConnected={handleRoomConnected}
            onTrackSubscribed={handleTrackSubscribed}
        >
            <h3>Room Name: {roomName}</h3>
            <ParticipantList /> {/* Hiển thị danh sách người tham gia */}
            <VideoConference /> {/* UI video call */}
        </LiveKitRoom>
    );
}
