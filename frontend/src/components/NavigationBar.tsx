"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Newspaper, Settings } from "lucide-react";
import Image from "next/image"; // Import Next.js Image component

const navItems = [
  { name: "HOME", href: "/", icon: Home },
  { name: "DASHBOARD", href: "/dashboard", icon: Map },
  { name: "NEWS", href: "/news", icon: Newspaper },
  { name: "NEWS 2.0", href: "/news_2", icon: Newspaper },
];

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <div className="h-screen w-64 flex flex-col border-r border-gray-100 bg-white">
      {/* Logo / Header */}
      <div className="px-6 py-5 mb-1">
        <div className="flex items-center gap-3">
          {/* Logo Image */}
          <Image
            src="/pyro-ai-logo.svg" // Path to your SVG in the public folder
            alt="Pyro AI Logo"
            width={32} // Adjust the size as needed
            height={32}
          />
          {/* Title */}
          <span className="text-xl font-semibold text-gray-900">PYRO.AI</span>
        </div>
        <hr className="mt-3 border-gray-200" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors
                ${
                  isActive
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {Icon && (
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? "stroke-[2.3px]" : "stroke-[1.8px]"
                  }`}
                />
              )}
              <span className={`${isActive ? "font-medium" : "font-normal"}`}>
                {name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Simplified Profile Section */}
      <div className="p-4 mt-auto border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-sm text-gray-600">A</span>
          </div>
        </div>
      </div>
    </div>
  );
}
