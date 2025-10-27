import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width: number;
  height: number;
  className?: string;
}

const Logo = ({ width, height, className }: LogoProps) => {
  return (
    <Image
      src="/logo.png?v=2"
      alt="Cuentia logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

export default Logo;
