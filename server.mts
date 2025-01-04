import next from 'next';

import { promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';

const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });

const handle = app.getRequestHandler();
export async function initializeAbuseMasker() {
    const trie = new Trie();
    try {
        const abuseWords = await fs.readFile(path.join(process.cwd(), 'abuses.txt'), 'utf-8');
        const words = abuseWords.split('\n').map((word) => word.trim());
        words.forEach((word) => {
            if (word) trie.insert(word);
        });
        return trie;
    } catch (error) {
        console.error(`Error loading abuse words: ${error}`);
        throw error;
    }
}
app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer);
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        socket.on('join-room', ({ room, username }) => {
            socket.join(room);
            console.log(`User ${username} joined room ${room}`);
            socket.to(room).emit('user_joined', `${username} joined room`);
        });
        socket.on('message', async ({ room, message, sender }) => {
            console.log(`Message from ${sender} in room ${room}: ${message}`);
            const trie = await initializeAbuseMasker();
            const maskedMessage = trie.searchAndMask(message);
            socket.to(room).emit('message', { sender, message: maskedMessage });
        });
        io.on('disconnect', () => {
            console.log(`User Disconnected: ${socket.id}`);
        });
    });

    httpServer.listen(port, () => {
        console.log(`Server running on http://${hostname}:${port}`);
    });
});

interface TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;
}

export class Trie {
    private root: TrieNode;

    constructor() {
        this.root = {
            children: new Map(),
            isEndOfWord: false,
        };
    }

    insert(word: string): void {
        let current = this.root;
        for (const char of word.toLowerCase()) {
            if (!current.children.has(char)) {
                current.children.set(char, {
                    children: new Map(),
                    isEndOfWord: false,
                });
            }
            current = current.children.get(char)!;
        }
        current.isEndOfWord = true;
    }

    private findWord(node: TrieNode, prefix: string, word: string): string | null {
        if (node.isEndOfWord) {
            return word;
        }

        for (const [char, childNode] of node.children.entries()) {
            const result = this.findWord(childNode, prefix + char, word);
            if (result) {
                return result;
            }
        }
        return null;
    }

    searchAndMask(text: string): string {
        const words = text.split(/\b/);
        const maskedWords = words.map((word) => {
            let current = this.root;
            const chars = word.toLowerCase().split('');

            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                if (!current.children.has(char)) {
                    return word;
                }
                current = current.children.get(char)!;

                if (current.isEndOfWord && i === chars.length - 1) {
                    return '*'.repeat(word.length);
                }
            }
            return word;
        });
        return maskedWords.join('');
    }
}
