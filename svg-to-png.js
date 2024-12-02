const fs = require('fs/promises');
const sharp = require('sharp');


const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <linearGradient id="reactGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#61DAFB"/>
      <stop offset="100%" stop-color="#A78BFA"/>
    </linearGradient>
    
    <radialGradient id="starGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="100%" stop-color="#A78BFA"/>
    </radialGradient>
  </defs>

  <circle 
    cx="64" 
    cy="64" 
    r="58" 
    fill="none" 
    stroke="url(#reactGradient)" 
    stroke-width="4"
    opacity="0.6"
  />

  <g filter="url(#glow)">
    <circle cx="64" cy="64" r="11.4" fill="#A78BFA"/>
    <path
      d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2z"
      fill="url(#reactGradient)"
    />
  </g>

  <g transform="scale(0.5) translate(128 128)" filter="url(#glow)">
    <path 
      d="M10 7.5L11.04 7.97L11.5 9L11.97 7.97L13 7.5L11.97 7.03L11.5 6L11.04 7.03L10 7.5" 
      fill="url(#starGradient)"
    />
    <path 
      d="M13 15L10.94 14.07L10 12L9.07 14.07L7 15L9.07 15.93L10 18L10.94 15.93L13 15" 
      fill="url(#starGradient)"
    />
    <path 
      d="M15.97 15.97L17 15.5L15.97 15.03L15.5 14L15.04 15.03L14 15.5L15.04 15.97L15.5 17L15.97 15.97" 
      fill="url(#starGradient)"
    />
  </g>

  <g transform="translate(90 20)" filter="url(#glow)">
    <path 
      d="M0 0L2 0.5L4 0L2 -0.5Z" 
      fill="url(#starGradient)"
    />
  </g>
  <g transform="translate(30 100)" filter="url(#glow)">
    <path 
      d="M0 0L2 0.5L4 0L2 -0.5Z" 
      fill="url(#starGradient)"
    />
  </g>
</svg>
`;

async function convertSvgToPng() {
  try {
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .png()
      .toBuffer();

    await fs.writeFile('react-wizard-logo.png', pngBuffer);
    console.log('PNG file created successfully: react-wizard-logo.png');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng();