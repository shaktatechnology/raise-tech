type IconProps = {
  className?: string;
};

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9v2.18H8v2.96h2.46V21h3.04Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 3.5c.5 1.6 1.6 2.7 3.4 2.9v2.9c-1.2.1-2.4-.3-3.4-1v6.6c0 3-2.4 5.1-5.2 5.1-2.9 0-5.2-2.3-5.2-5.2 0-2.9 2.5-5.2 5.4-5.1v3c-.2 0-.4-.1-.6-.1-1.3 0-2.4 1.1-2.4 2.4 0 1.4 1.1 2.4 2.4 2.4 1.4 0 2.5-1.1 2.5-2.5V3.5h3.1Z" />
    </svg>
  );
}
