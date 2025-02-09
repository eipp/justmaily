import React, { useContext } from 'react';
import { ThemeProvider, ThemeContext } from '../src/theme/ThemeProvider';
import AccessibleImage from '../src/components/AccessibleImage';
import CollaborativeEditor from '../src/components/CollaborativeEditor';
import ARPreview from '../src/components/ARPreview';

const Sprint4Demo: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{ padding: '20px' }}>
      <header>
        <h1>JustMaily Sprint 4 Demo</h1>
        <button onClick={toggleTheme} aria-label="Toggle theme">
          Toggle Theme (Current: {theme})
        </button>
      </header>
      <main>
        <section style={{ marginTop: '20px' }}>
          <h2>Accessible Image</h2>
          <AccessibleImage src="/image.jpg" width={400} height={300} />
        </section>
        <section style={{ marginTop: '20px' }}>
          <h2>Collaborative Editor</h2>
          <CollaborativeEditor />
        </section>
        <section style={{ marginTop: '20px' }}>
          <h2>AR Preview</h2>
          <ARPreview />
        </section>
      </main>
    </div>
  );
};

const Page: React.FC = () => (
  <ThemeProvider>
    <Sprint4Demo />
  </ThemeProvider>
);

export default Page;
