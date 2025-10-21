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
      src="/logo.png"
      alt="Logo de la aplicación"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

export default Logo;
