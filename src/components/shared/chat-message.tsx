type Props = {
    isOwnMessage: boolean;
    message: string;
    sender: string;
};
const ChatMessage = ({ isOwnMessage, sender, message }: Props) => {
    const isSystemMessage = sender === 'system';

    return (
        <div
            className={`flex ${isSystemMessage ? 'justify-center' : isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
        >
            <div
                className={`max-wxs rounded-lg px-4 py-2 ${isSystemMessage ? 'bg-gray-800 text-center text-xs text-white' : isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-black'} `}
            >
                {!isSystemMessage && <p className='text-sm font-bold'>{sender}</p>}
                <p>{message}</p>
            </div>
        </div>
    );
};

export default ChatMessage;
