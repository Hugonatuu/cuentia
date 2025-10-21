import { SVGProps } from 'react';

export default function CuentiaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 160 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="30"
        fontFamily="Luckiest Guy, cursive"
        fontSize="32"
        fill="#3b82f6"
      >
        Cuentia
      </text>
      <path
        d="M125 5l3.33 6.67L135 15l-6.67 3.33L125 25l-3.33-6.67L115 15l6.67-3.33L125 5z"
        fill="#facc15"
      />
      <path
        d="M140 12l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5 2.5-5z"
        fill="#facc15"
      />
       <path
        d="M152 2l1.67 3.33L157 7l-3.33 1.67L152 12l-1.67-3.33L147 7l3.33-1.67L152 2z"
        fill="#facc15"
      />
    </svg>
  );
}
