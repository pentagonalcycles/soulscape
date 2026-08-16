"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function VisitorTracker() {
  const pathname = usePathname();
  const { session } = useAuth();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    // Don't track admin pages
    if (pathname.startsWith("/admin") || pathname.startsWith("/moderation")) return;

    const logVisit = async () => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }

        // Get page title from document
        const pageTitle = document.title || pathname;

        await fetch("/api/admin/visitors", {
          method: "POST",
          headers,
          body: JSON.stringify({
            page_path: pathname,
            page_title: pageTitle,
          }),
        });
      } catch {
        // Silent fail - tracking shouldn't break the site
      }
    };

    // Small delay to let the page load
    const timer = setTimeout(logVisit, 1000);
    return () => clearTimeout(timer);
  }, [pathname, session]);

  return null; // This component doesn't render anything
}
