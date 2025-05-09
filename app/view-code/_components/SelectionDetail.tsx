import React, { useMemo } from "react";
import { RECORD } from "../[uid]/page";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

function SelectionDetail({ record, regenrateCode, isReady }: any) {
  // Create an absolute URL for the image if it's a relative path
  const absoluteImageUrl = useMemo(() => {
    if (!record?.imageUrl) return "";

    return record.imageUrl.startsWith("/")
      ? `${window.location.origin}${record.imageUrl}`
      : record.imageUrl;
  }, [record?.imageUrl]);

  return (
    record && (
      <div className="p-5 bg-gray-100 rounded-lg">
        <h2 className="font-bold my-2">Wireframe</h2>
        <div className="relative">
          <Image
            src={absoluteImageUrl}
            alt="Wireframe"
            width={300}
            height={400}
            className="rounded-lg object-contain h-[200px] w-full border border-dashed p-2 bg-white"
            unoptimized={true} // Ensure no image optimization to preserve exact wireframe
          />
        </div>

        <h2 className="font-bold mt-4 mb-2">AI Model</h2>
        <Input
          defaultValue={record?.model}
          disabled={true}
          className="bg-white"
        />

        <h2 className="font-bold mt-4 mb-2">Description</h2>
        <Textarea
          defaultValue={record?.description}
          disabled={true}
          className="bg-white h-[180px]"
        />

        <Button
          className="mt-7 w-full"
          disabled={!isReady}
          onClick={() => regenrateCode()}
        >
          <RefreshCcw className="mr-2" /> Regenerate Code
        </Button>
      </div>
    )
  );
}

export default SelectionDetail;
