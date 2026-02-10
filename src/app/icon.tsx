import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
// Let Next.js handle the content type to generate a proper .ico file.
// export const contentType = 'image/png';

// Image generation
export default function Icon() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:9002';
  const logoUrl = `${baseUrl}/cuentos/logo.png?v=3`;
    
  // The background color is from globals.css --background variable
  const backgroundColor = '#E0F7FF';
  
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: backgroundColor,
          borderRadius: '50%',
        }}
      >
        <img 
            src={logoUrl}
            width="24"
            height="24"
            alt="Cuentia Logo" 
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
