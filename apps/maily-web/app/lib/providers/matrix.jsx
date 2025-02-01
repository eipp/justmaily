"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatrixProvider = MatrixProvider;
exports.useMatrixClient = useMatrixClient;
const react_1 = require("react");
const matrix_bot_sdk_1 = require("matrix-bot-sdk");
const MatrixContext = (0, react_1.createContext)(null);
function MatrixProvider({ children }) {
    const [client, setClient] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        initializeClient();
        return () => {
            if (client) {
                client.stop();
            }
        };
    }, []);
    const initializeClient = async () => {
        try {
            const homeserverUrl = process.env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL;
            const accessToken = process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN;
            const storage = new matrix_bot_sdk_1.SimpleFsStorageProvider('matrix-store.json');
            const newClient = new matrix_bot_sdk_1.MatrixClient(homeserverUrl, accessToken, storage);
            // Set up event handlers
            newClient.on('room.message', handleRoomMessage);
            newClient.on('room.join', handleRoomJoin);
            newClient.on('room.leave', handleRoomLeave);
            // Start the client
            await newClient.start();
            setClient(newClient);
            setIsConnected(true);
        }
        catch (err) {
            setError(err);
            console.error('Failed to initialize Matrix client:', err);
        }
    };
    const handleRoomMessage = async (roomId, event) => {
        // Handle incoming room messages
        if (event.type !== 'm.room.message')
            return;
        // Process message based on type
        switch (event.content.msgtype) {
            case 'm.text':
                // Handle text message
                break;
            case 'm.image':
                // Handle image message
                break;
            case 'm.file':
                // Handle file message
                break;
            case 'm.notice':
                // Handle notice/system message
                break;
        }
    };
    const handleRoomJoin = (roomId, event) => {
        // Handle room join events
    };
    const handleRoomLeave = (roomId, event) => {
        // Handle room leave events
    };
    const sendMessage = (0, react_1.useCallback)(async (roomId, content) => {
        if (!client)
            throw new Error('Matrix client not initialized');
        try {
            await client.sendMessage(roomId, Object.assign({ msgtype: 'm.text', body: content.body }, content));
        }
        catch (err) {
            setError(err);
            throw err;
        }
    }, [client]);
    const joinRoom = (0, react_1.useCallback)(async (roomId) => {
        if (!client)
            throw new Error('Matrix client not initialized');
        try {
            await client.joinRoom(roomId);
        }
        catch (err) {
            setError(err);
            throw err;
        }
    }, [client]);
    const createRoom = (0, react_1.useCallback)(async (options) => {
        if (!client)
            throw new Error('Matrix client not initialized');
        try {
            const roomId = await client.createRoom({
                name: options.name,
                topic: options.topic,
                visibility: options.isPublic ? 'public' : 'private',
                preset: options.isPublic ? 'public_chat' : 'private_chat',
                initial_state: [
                    {
                        type: 'm.room.history_visibility',
                        state_key: '',
                        content: {
                            history_visibility: 'shared'
                        }
                    }
                ]
            });
            return roomId;
        }
        catch (err) {
            setError(err);
            throw err;
        }
    }, [client]);
    return (<MatrixContext.Provider value={{
            client,
            isConnected,
            error,
            sendMessage,
            joinRoom,
            createRoom
        }}>
      {children}
    </MatrixContext.Provider>);
}
function useMatrixClient() {
    const context = (0, react_1.useContext)(MatrixContext);
    if (!context) {
        throw new Error('useMatrixClient must be used within a MatrixProvider');
    }
    return context;
}
