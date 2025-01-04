'use client';

import { useState } from 'react';

import { Button } from '../ui/button';

const ChatForm = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
    const [message, setMessage] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== '') {
            onSendMessage(message);
        }
        setMessage('');
        console.log('submitted');
    };
    return (
        <form onSubmit={handleSubmit} className='mt-4 flex gap-2'>
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className='flex-1 rounded-lg border-2 px-4 focus:outline-none'
                type='text'
                placeholder='Type your message...'
            />
            <Button className='rounded-lg py-4' type='submit'>
                Send
            </Button>
        </form>
    );
};

export default ChatForm;
