import React from 'react';

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        background-color: #f5f5f5;
        color: #333;
      }
      * {
        box-sizing: border-box;
      }
    `}</style>
  );
} 