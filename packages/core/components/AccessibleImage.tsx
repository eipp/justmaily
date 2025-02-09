import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AccessibleImageProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  [key: string]: any;
}

async function generateAltText(src: string): Promise<string> {
  // Dummy implementation. In production, integrate an AI API to generate alt text.
  return `Description for image ${src}`;
}

const AccessibleImage: React.FC<AccessibleImageProps> = (props) => {
  const { src, alt: initialAlt, ...rest } = props;
  const [alt, setAlt] = useState(initialAlt || '');

  useEffect(() => {
    if (!initialAlt) {
      generateAltText(src).then((generated) => setAlt(generated));
    }
  }, [src, initialAlt]);

  return <Image src={src} alt={alt} {...rest} />;
};

export default AccessibleImage; 