"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef, useTransition, type AnchorHTMLAttributes, type MouseEvent } from "react";
import { signIn } from "next-auth/react";

type SmartSignInLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & {
    callbackUrl?: string;
    href?: string;
  };

export const SmartSignInLink = forwardRef<HTMLAnchorElement, SmartSignInLinkProps>(function SmartSignInLink(
  { callbackUrl = "/today", href = "/login", onClick, ...props },
  ref
) {
  const [, startTransition] = useTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobileViewport) {
      return;
    }

    event.preventDefault();
    startTransition(() => {
      void signIn("github", { callbackUrl });
    });
  };

  return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
});
