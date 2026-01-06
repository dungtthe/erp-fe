"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Pencil, Play, Plus, Save, Trash, X } from "lucide-react";
import Link from "next/link";

const ACTION_CONFIG = {
  create: {
    label: "Thêm mới",
    icon: Plus,
    variant: "default",
    className: "bg-primary text-primary-foreground",
  },
  save: {
    label: "Lưu",
    icon: Save,
    variant: "default",
    className: "bg-primary text-primary-foreground",
  },
  cancel: {
    label: "Hủy",
    icon: X,
    variant: "outline",
    className: "border-muted-foreground text-foreground",
  },
  delete: {
    label: "Xóa",
    icon: Trash,
    variant: "destructive",
    className: "",
  },
  start: {
    label: "Bắt đầu",
    icon: Play,
    variant: "default",
    className: "bg-primary text-primary-foreground",
  },
  finish: {
    label: "Kết thúc",
    icon: Check,
    variant: "outline",
    className: "border-muted-foreground text-foreground",
  },
  edit: {
    label: "Chỉnh sửa",
    icon: Pencil,
    variant: "outline",
    className: "border-muted-foreground text-foreground",
  },
} as const;

type ActionType = "create" | "save" | "cancel" | "delete" | "start" | "finish" | "edit";

type ActionButtonProps = {
  action: ActionType;
  href?: string;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Button>;

export default function ActionButton({ action, href, children, className, ...props }: ActionButtonProps) {
  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  const content = (
    <>
      <Icon className="mr-2 h-4 w-4" />
      {children ?? config.label}
    </>
  );

  const mergedClassName = cn(config.className, className);

  if (href) {
    return (
      <Button asChild variant={config.variant} className={mergedClassName} {...props}>
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button variant={config.variant} className={mergedClassName} {...props}>
      {content}
    </Button>
  );
}
