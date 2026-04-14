interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "muted";
  className?: string;
}

export default function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const variants = {
    primary: "bg-[#E0F7FF] text-[#0077B6]",
    success: "bg-[#DCFCE7] text-[#16A34A]",
    muted: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
