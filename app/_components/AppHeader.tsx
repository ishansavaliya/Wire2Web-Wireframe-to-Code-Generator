import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import Image from "next/image";

function AppHeader({ hideSidebar = false }) {
  return (
    <div className="p-4 shadow-sm flex items-center justify-between w-full ">
      {!hideSidebar ? (
        <SidebarTrigger />
      ) : (
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
      )}
      <div className="flex items-center gap-2">
        <h2 className="font-bold">Wire2Web</h2>
      </div>
    </div>
  );
}

export default AppHeader;
