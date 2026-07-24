import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  avatarUrl?: string;
}

const sizeClass = {
  sm: "avatar-sm",
  md: "",
  lg: "avatar-lg",
};

export function Avatar({ name, size = "md", avatarUrl }: AvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`avatar ${sizeClass[size]}`}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <div className={`avatar ${sizeClass[size]}`}>{getInitials(name)}</div>;
}
