"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";
import { Map, Images, LogOut } from "lucide-react";
import clsx from "clsx";
import "../../app/globals.css";

const LINKS = [
  { label: "Programs", href: "/dashboard/programs", icon: Map },
  { label: "Gallery", href: "/dashboard/gallery", icon: Images },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.push("/dashboard/login");
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-charcoal/10 bg-warm-ivory px-5 py-8">
      <div>
        <div className="relative mb-10 ml-2 h-7 w-28">
          <Image
            src="/brand/logo-wordmark.png"
            alt="Tasia"
            fill
            className="object-contain object-left"
            sizes="112px"
          />
        </div>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-navy text-warm-ivory"
                    : "text-charcoal/75 hover:bg-warm-beige/60"
                )}
              >
                <Icon size={17} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-charcoal/60 hover:bg-warm-beige/60"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  );
}
