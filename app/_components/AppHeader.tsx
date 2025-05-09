import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, Paintbrush } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Workspace",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Design",
    url: "/designs",
    icon: Paintbrush,
  },
];

function AppHeader() {
  const path = usePathname();

  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full bg-white border-b border-gray-200 text-sm py-3 sm:py-0 dark:bg-neutral-800 dark:border-neutral-700">
      <nav
        className="relative w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 max-w-[85rem]"
        aria-label="Global"
      >
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Image
              src={"/Wire2WebLogo.png"}
              alt="logo"
              width={100}
              height={100}
              className="w-[40px] h-[40px]"
            />
            <h2 className="font-bold text-lg">Wire2Web</h2>
          </div>
        </Link>

        <div className="flex items-center sm:justify-end gap-x-2">
          {items.map((item, index) => (
            <Link href={item.url} key={index}>
              <div
                className={`flex items-center gap-x-2 font-medium py-2 sm:py-0 sm:ms-4 sm:my-6 sm:ps-6 hover:text-blue-600 transition-colors ${
                  index > 0
                    ? "sm:border-s sm:border-gray-300 dark:border-neutral-700"
                    : ""
                } ${
                  path?.includes(item.url) ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export default AppHeader;
