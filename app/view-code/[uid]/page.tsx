"use client";
import AppHeader from "@/app/_components/AppHeader";
import Constants from "@/data/Constants";
import axios from "axios";
import { Loader2, LoaderCircle } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import SelectionDetail from "../_components/SelectionDetail";
import CodeEditor from "../_components/CodeEditor";
import { read } from "fs";

export type RECORD = {
  id: number;
  uid: string;
  imageUrl: string;
  code: {
    resp: string;
  };
  description: string;
  model: string;
};

function ViewCode() {
  const { uid } = useParams();
  const [loading, setLoading] = useState(false);
  const [codeResp, setCodeResp] = useState("");
  const [record, setRecord] = useState<RECORD | null>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== undefined) {
      uid && GetRecordInfo();
    }
  }, [uid]);

  const GetRecordInfo = async (regen = false) => {
    console.log("RUN...");
    setIsReady(false);
    setCodeResp("");
    setLoading(true);

    try {
      const result = await axios.get("/api/wireframe-to-code?uid=" + uid);
      const resp = result?.data;
      setRecord(result?.data);

      if (resp?.code == null || regen) {
        GenerateCode(resp);
      } else {
        setCodeResp(resp?.code?.resp);
        setLoading(false);
        setIsReady(true);
      }

      if (resp?.error) {
        console.log("No Record Found");
      }
    } catch (error) {
      console.error("Error fetching record:", error);
      setLoading(false);
    }
  };

  const GenerateCode = async (record: RECORD) => {
    setLoading(true);

    // Create an absolute URL for the image if it's a relative path
    const imageUrl = record?.imageUrl;
    const absoluteImageUrl = imageUrl?.startsWith("/")
      ? `${window.location.origin}${imageUrl}`
      : imageUrl;

    console.log("Using image URL for AI:", absoluteImageUrl);

    const res = await fetch("/api/ai-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: record?.description + ":" + Constants.PROMPT,
        model: record.model,
        imageUrl: absoluteImageUrl,
      }),
    });

    if (!res.body) return;
    setLoading(false);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder
        .decode(value)
        .replace("```jsx", "")
        .replace("```javascript", "")
        .replace("javascript", "")
        .replace("jsx", "")
        .replace("```", "");
      setCodeResp((prev) => prev + text);
      console.log(text);
    }

    setIsReady(true);
    UpdateCodeToDb();
  };

  useEffect(() => {
    if (codeResp != "" && record?.uid && isReady && record?.code == null) {
      UpdateCodeToDb();
    }
  }, [codeResp && record && isReady]);

  const UpdateCodeToDb = async () => {
    console.log(record);
    const result = await axios.put("/api/wireframe-to-code", {
      uid: record?.uid,
      codeResp: { resp: codeResp },
    });

    console.log(result);
  };

  return (
    <div>
      <AppHeader hideSidebar={true} />
      <div className="grid grid-cols-1 md:grid-cols-5 p-5 gap-10">
        <div>
          {/* Selection Details  */}
          <SelectionDetail
            record={record}
            regenrateCode={() => {
              GetRecordInfo(true);
            }}
            isReady={isReady}
          />
        </div>
        <div className="col-span-4">
          {/* Code Editor  */}
          {loading ? (
            <div>
              <h2
                className="font-bold text-2xl text-center p-20 flex items-center justify-center
                        bg-slate-100 h-[80vh] rounded-xl
                        "
              >
                {" "}
                <Loader2 className="animate-spin" /> Anaylzing the Wireframe...
              </h2>
            </div>
          ) : (
            <CodeEditor codeResp={codeResp} isReady={isReady} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewCode;
