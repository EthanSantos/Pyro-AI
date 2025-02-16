"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Settings } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Map },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "News", href: "/news", icon: Settings },
];


export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 flex flex-col border-r border-gray-200 bg-white">
      {/* Logo / Header */}
      <div className="p-4 flex items-center gap-2 border-b border-gray-200">
        <span className="text-lg font-bold">PYRO.AI</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
