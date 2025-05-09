import React from "react";
import {
  Sandpack,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import Constants from "@/data/Constants";
import { nightOwl } from "@codesandbox/sandpack-themes";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function CodeEditor({ codeResp, isReady }: any) {
  // Function to copy code to clipboard
  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(codeResp);
    toast.success("Code copied to clipboard!");
  };

  // Function to download code as a file
  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([codeResp], { type: "text/javascript" });
    element.href = URL.createObjectURL(file);
    element.download = "code.js";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Code downloaded successfully!");
  };

  return (
    <div>
      {isReady && (
        <div className="flex justify-end gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyCodeToClipboard}
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Copy Code
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCode}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )}
      {isReady ? (
        <Sandpack
          template="react"
          theme={nightOwl}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
            showNavigator: true,
            showTabs: true,
            editorHeight: 600,
          }}
          customSetup={{
            dependencies: {
              ...Constants.DEPENDANCY,
            },
          }}
          files={{
            "/App.js": `${codeResp}`,
          }}
        />
      ) : (
        <SandpackProvider
          template="react"
          theme={nightOwl}
          files={{
            "/app.js": {
              code: `${codeResp}`,
              active: true,
            },
          }}
          customSetup={{
            dependencies: {
              ...Constants.DEPENDANCY,
            },
          }}
          options={{
            externalResources: ["https://cdn.tailwindcss.com"],
          }}
        >
          <SandpackLayout>
            <SandpackCodeEditor showTabs={true} style={{ height: "70vh" }} />
          </SandpackLayout>
        </SandpackProvider>
      )}
    </div>
  );
}

export default CodeEditor;
