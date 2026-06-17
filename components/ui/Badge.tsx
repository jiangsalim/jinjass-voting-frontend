interface BadgeProps {
  count: number;
  className?: string;
}

export default function Badge({ count, className = '' }: BadgeProps) {
  if (count === 0) return null;

  return (
    <span className={`bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}