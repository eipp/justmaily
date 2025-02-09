import React, { useEffect, useRef, useState } from 'react';

const CollaborativeEditor: React.FC = () => {
  const [text, setText] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to the collaborative WebSocket endpoint. Replace the URL with production endpoint as needed.
    socketRef.current = new WebSocket("ws://localhost:8080");
    const socket = socketRef.current;

    socket.onopen = () => {
      console.log("Connected to collaborative WebSocket");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "UPDATE_TEXT") {
          // Only update if the payload is different from current text
          if (message.payload !== text) {
            setText(message.payload);
          }
        }
      } catch (error) {
        console.error("Error parsing incoming message:", error);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket");
    };

    return () => {
      socket.close();
    };
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "UPDATE_TEXT", payload: newText }));
    }
  };

  return (
    <textarea
      value={text}
      onChange={handleChange}
      style={{ width: "100%", height: "200px" }}
      aria-label="Collaborative editor"
    />
  );
};

export default CollaborativeEditor; 