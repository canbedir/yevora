import Image from "next/image";

import { cn } from "@/lib/utils";

interface YevoraLogoProps {
  alt?: string;
  className?: string;
  priority?: boolean;
}

export function YevoraLogo({
  alt = "Yevora logo",
  className,
  priority = false,
}: YevoraLogoProps) {
  return (
    <Image
      src="/yevora-logo.png"
      alt={alt}
      width={716}
      height={620}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}
