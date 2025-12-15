import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type ContainerPageProps = {
  children?: ReactNode;
  className?: string;
};

export default function ContainerPage({ children, className }: ContainerPageProps) {
  return <div className={cn("bg-background mt-5", className)}>{children}</div>;
}
