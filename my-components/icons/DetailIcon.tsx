import { Eye } from "lucide-react";
import React from "react";

interface DetailIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}
export const DetailIcon: React.FC<DetailIconProps> = ({ size = 20, className = "", strokeWidth = 2, onClick }) => {
  return <Eye size={size} className={`cursor-pointer hover:text-primary transition-colors ${className}`} strokeWidth={strokeWidth} onClick={onClick} />;
};
export default DetailIcon;
