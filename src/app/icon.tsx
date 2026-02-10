import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};

// Image generation
export default function Icon() {
  // Use the absolute URL to ensure the logo is found during the build process on Vercel.
  const logoUrl = 'https://cuentia.net/cuentos/logo.png?v=3';
    
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img 
            src={logoUrl}
            width="32"
            height="32"
            alt="Cuentia Logo" 
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
