'use client';

import {
    LiveKitRoom,
    useParticipants,
    useRoomContext,
    ParticipantName,
    useTracks,
    TrackLoop,
    VideoTrack,
    AudioTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ParticipantList() {
    const participants = useParticipants();

    useEffect(() => {
        console.log('👥 Participants list updated:', participants.map(p => p.identity));
    }, [participants]);

    return (
        <div className="bg-gray-900 text-white p-4 rounded-md shadow-md max-w-xs">
            <h2 className="font-bold mb-2">👥 Participants ({participants.length}):</h2>
            <ul className="space-y-1 text-sm">
                {[...participants].map((p) => (
                    <li key={p.sid}>{p.identity}</li>
                ))}
            </ul>
        </div>
    );
}

function CustomVideoGrid() {
    const tracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: true }],
        { onlySubscribed: false }
    );

    useEffect(() => {
        console.log('📡 Tracks updated:', tracks.map(t => ({
            participant: t.participant.identity,
            isPlaceholder: t.publication?.isPlaceholder,
            videoKind: t.publication?.track?.kind,
        })));
    }, [tracks]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <TrackLoop tracks={tracks}>
                {(trackRef) => {
                    const isPlaceholder = trackRef.publication?.isPlaceholder;
                    const participantName = trackRef.participant.identity;

                    console.log(`🎞️ Rendering track for: ${participantName}, isPlaceholder: ${isPlaceholder}`);

                    return (
                        <div
                            key={trackRef.publication?.trackSid || trackRef.participant.sid}
                            className="relative bg-gray-800 rounded-md overflow-hidden h-60 flex items-center justify-center"
                        >
                            {/* Nếu có video thật thì hiển thị */}
                            {!isPlaceholder && (
                                <>
                                    <VideoTrack
                                        trackRef={trackRef}
                                        className="w-full h-full object-cover"
                                    />
                                    <AudioTrack trackRef={trackRef} />
                                </>
                            )}

                            {/* Nếu là placeholder (tắt cam) thì hiển thị avatar */}
                            {isPlaceholder && (
                                <div className="flex flex-col items-center justify-center z-10">
                                    <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                        {participantName.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="mt-2 text-sm text-white opacity-70">Camera off</p>
                                </div>
                            )}

                            {/* Tên người luôn hiển thị */}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-2 py-1 rounded text-sm text-white z-20">
                                <ParticipantName participant={trackRef.participant} />
                            </div>
                        </div>
                    );
                }}
            </TrackLoop>
        </div>
    );
}

function RoomInfo() {
    const room = useRoomContext();
    const [roomName, setRoomName] = useState('');

    useEffect(() => {
        if (!room) return;

        setRoomName(room.name);
        console.log('✅ Connected to room:', room.name);

        const handleParticipantConnected = (p) => console.log('➕ Participant joined:', p.identity);
        const handleParticipantDisconnected = (p) => console.log('➖ Participant left:', p.identity);
        const handleTrackSubscribed = (track, pub, p) =>
            console.log('🎥 Track subscribed:', track.kind, 'from', p.identity);

        room.on('participantConnected', handleParticipantConnected);
        room.on('participantDisconnected', handleParticipantDisconnected);
        room.on('trackSubscribed', handleTrackSubscribed);

        return () => {
            room.off('participantConnected', handleParticipantConnected);
            room.off('participantDisconnected', handleParticipantDisconnected);
            room.off('trackSubscribed', handleTrackSubscribed);
        };
    }, [room]);

    return (
        <div className="absolute top-4 left-4 z-10">
            <h3 className="text-lg font-semibold text-white">📡 Room: {roomName}</h3>
            <ParticipantList />
        </div>
    );
}

export default function RoomPage() {
    const params = useSearchParams();
    const token = params.get('token');
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!token) {
        console.warn('⚠️ No token found in URL, waiting...');
        return <div className="text-white p-4">🔄 Loading room...</div>;
    }

    console.log('🎫 Token received:', token);
    console.log('🌐 LiveKit Server URL:', serverUrl);

    return (
        <div className="relative w-full h-screen bg-black text-white overflow-y-auto">
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl || ''}
                connect={true}
                audio={true}
                video={true}
                className="w-full h-full"
            >
                <RoomInfo />
                <div className="pt-28">
                    <CustomVideoGrid />
                </div>
            </LiveKitRoom>
        </div>
    );
}
