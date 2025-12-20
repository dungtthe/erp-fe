import { Trash2 } from "lucide-react";
import React from "react";

interface TrashIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

export const DeleteIcon: React.FC<TrashIconProps> = ({ size = 20, className = "", strokeWidth = 2, onClick }) => {
  return (
    <div className="hover:bg-destructive/10 p-1 rounded-sm">
      <Trash2 size={size} strokeWidth={strokeWidth} onClick={onClick} className={`cursor-pointer hover:text-destructive  transition-colors ${className}`} />
    </div>
  );
};

export default DeleteIcon;
