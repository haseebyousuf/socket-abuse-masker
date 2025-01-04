'use client';

import { useEffect, useState } from 'react';

import ChatForm from '@/components/shared/chat-form';
import ChatMessage from '@/components/shared/chat-message';
import { Button } from '@/components/ui/button';
import { socket } from '@/lib/socket-client';

export default function Home() {
    const [room, setRoom] = useState('');
    const [joined, setJoined] = useState(false);
    const [userName, setUserName] = useState('');
    const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);

    useEffect(() => {
        socket.on('message', (data) => {
            setMessages((prev) => [...prev, data]);
        });
        socket.on('user_joined', (message) => {
            setMessages((prev) => [...prev, { sender: 'system', message }]);
        });

        return () => {
            socket.off('user_joined');
            socket.off('message');
        };
    }, []);
    const handleSendMessage = (message: string) => {
        const data = { room, message, sender: userName };
        setMessages((prev) => [...prev, { sender: userName, message }]);
        socket.emit('message', data);
    };
    const handleJoinRoom = () => {
        if (room && userName) {
            socket.emit('join-room', { room, username: userName });
            setJoined(true);
        }
    };
    return (
        <div className='mt-24 flex w-full justify-center'>
            {!joined ? (
                <div className='mx-auto flex w-full max-w-3xl flex-col items-center'>
                    <h1 className='mb-4 text-2xl font-bold'>Join a Room</h1>
                    <input
                        type='text'
                        placeholder='Enter your username'
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className='mb-4 w-64 rounded-lg border-2 px-4 py-2'
                    />
                    <input
                        type='text'
                        placeholder='Enter room name'
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className='mb-4 w-64 rounded-lg border-2 px-4 py-2'
                    />
                    <Button onClick={handleJoinRoom} className='rounded-lg bg-blue-500 px-4 py-2 text-white'>
                        Join Room
                    </Button>
                </div>
            ) : (
                <div className='mx-auto w-full max-w-3xl'>
                    <h1 className='mb-4 text-2xl font-bold'>Room : {room}</h1>
                    <div className='mb-4 h-[500px] overflow-y-auto rounded-lg border-2 bg-gray-200 p-4'>
                        {messages?.map((msg, index) => (
                            <ChatMessage
                                key={index}
                                sender={msg.sender}
                                message={msg.message}
                                isOwnMessage={msg.sender === userName}
                            />
                        ))}
                    </div>
                    <div>
                        <ChatForm onSendMessage={handleSendMessage} />
                    </div>
                </div>
            )}
        </div>
    );
}
