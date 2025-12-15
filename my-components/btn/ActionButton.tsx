"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Save, X, Trash } from "lucide-react";

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
} as const;

type ActionType = "create" | "save" | "cancel" | "delete";

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
