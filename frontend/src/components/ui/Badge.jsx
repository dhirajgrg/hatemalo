const badgeVariants = {
  default: "bg-surface-alt text-text-secondary border-border",
  primary: "bg-primary-100 text-primary-800 border-primary-200",
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  danger: "bg-red-100 text-red-800 border-red-200",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium
        ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
