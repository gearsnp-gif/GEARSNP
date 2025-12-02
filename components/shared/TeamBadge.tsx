interface TeamBadgeProps {
  teamName: string;
  teamColor?: string;
  size?: "sm" | "md" | "lg";
}

export default function TeamBadge({ 
  teamName, 
  teamColor = "#dc2626",
  size = "md" 
}: TeamBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: `${teamColor}20`,
        color: teamColor,
        border: `1px solid ${teamColor}40`,
      }}
    >
      {teamName}
    </span>
  );
}
