import type { SVGProps } from "react";

export const CameraIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M20 5H16.85C16.5 5 16.2 4.85 16 4.6L15.35 3.3C15 2.55 14.35 2 13.55 2H10.45C9.65 2 9 2.55 8.65 3.3L8 4.6C7.8 4.85 7.5 5 7.15 5H4C2.35 5 1 6.35 1 8V17C1 18.65 2.35 20 4 20H20C21.65 20 23 18.65 23 17V8C23 6.35 21.65 5 20 5ZM12 16.5C9.5 16.5 7.5 14.5 7.5 12C7.5 9.5 9.5 7.5 12 7.5C14.5 7.5 16.5 9.5 16.5 12C16.5 14.5 14.5 16.5 12 16.5Z"
        fill="currentColor"
      />
    </svg>
  );
};
