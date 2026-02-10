import { ImageResponse } from 'next/server';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
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
            // The logo is served from the public folder, but ImageResponse requires an absolute URL.
            // Using the production domain as a base.
            src="https://cuentia.net/cuentos/logo.png?v=3"
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
