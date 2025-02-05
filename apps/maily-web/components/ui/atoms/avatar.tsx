import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 40 }) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
};

export const AvatarImage = Avatar;

export const AvatarFallback: React.FC = () => (
  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#ccc' }}></div>
);

export default Avatar; 