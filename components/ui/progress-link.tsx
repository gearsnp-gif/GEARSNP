"use client";

import Link, { LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { ReactNode, MouseEvent } from "react";

interface ProgressLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export function ProgressLink({ children, href, className, ...props }: ProgressLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    NProgress.start();
    router.push(href.toString());
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
