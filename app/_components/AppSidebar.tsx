import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Home, Paintbrush } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

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

export function AppSidebar() {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Image
              src={"/Wire2WebLogo.png"}
              alt="logo"
              width={100}
              height={100}
              className="w-[40px] h-[40px]"
            />
            <h2 className="font-bold text-lg">Wire2Web</h2>
          </div>
          <h2 className="text-sm text-gray-400 text-center">Build Awesome</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mt-5">
              {items.map((item, index) => (
                <Link href={item.url} key={index}>
                  <div
                    className={`p-2 text-lg flex gap-2 items-center hover:bg-gray-100 rounded-lg ${
                      path.includes(item.url) && "bg-gray-200"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
