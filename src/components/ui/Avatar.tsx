interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-5 h-5 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function hashColor(str: string): string {
  const colors = [
    'bg-sky-600', 'bg-emerald-600', 'bg-amber-600',
    'bg-rose-600', 'bg-teal-600', 'bg-cyan-600',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? hashColor(name) : 'bg-slate-600';

  return src ? (
    <img
      src={src}
      alt={name ?? 'Avatar'}
      className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700/50 shrink-0 ${className}`}
    />
  ) : (
    <div
      className={`
        ${sizeClasses[size]} ${bgColor} ${className}
        rounded-full flex items-center justify-center
        font-semibold text-white shrink-0 border border-white/10
      `}
    >
      {initials}
    </div>
  );
}
