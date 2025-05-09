"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CloudUpload,
  Loader2Icon,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import Image from "next/image";
//@ts-ignore
import uuid4 from "uuid4";
import React, { ChangeEvent, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";
import Constants from "@/data/Constants";
import { toast } from "sonner";

function ImageUpload() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<any>();
  const [model, setModel] = useState<string>();
  const [description, setDescription] = useState<string>("");
  const [suggestedDescription, setSuggestedDescription] = useState<string>("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const OnImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log(files[0]);
      const imageUrl = URL.createObjectURL(files[0]);
      setFile(files[0]);
      setPreviewUrl(imageUrl);
      setSuggestedDescription(""); // Reset suggested description when new image is uploaded
    }
  };

  const generateWireframeDescription = async () => {
    if (!file || !previewUrl) {
      toast("Please select an image first!");
      return;
    }

    setIsGeneratingDescription(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorResult = await uploadResponse.json();
        console.error("Image upload failed:", errorResult.error);
        toast(`Image upload failed: ${errorResult.error || "Server error"}`);
        setIsGeneratingDescription(false);
        return;
      }

      const uploadResult = await uploadResponse.json();
      const imageUrl =
        uploadResult.fullUrl || window.location.origin + uploadResult.imageUrl;

      // Use an AI model to analyze the wireframe and suggest a description
      const response = await fetch("/api/ai-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description:
            "Analyze this wireframe image and provide a detailed description listing all UI elements present, their arrangement, and purpose. Focus on layout, structure, and content elements without adding design opinions.",
          model: "Deepseek", // Use Deepseek as it's configured for Qwen visual model
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze wireframe");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response");
      }

      let result = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        result += text;
      }

      setSuggestedDescription(result.trim());

      // Automatically populate the description field if it's empty
      if (!description) {
        setDescription(result.trim());
      }
    } catch (error) {
      console.error("Error analyzing wireframe:", error);
      toast(
        "Failed to analyze wireframe. Please try again or enter description manually."
      );
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const OnConverToCodeButtonClick = async () => {
    if (!file || !model || !description) {
      console.log("Select All Field");
      toast("Please select an image, AI model, and enter a description.");
      return;
    }
    setLoading(true);

    let imageUrl = "";
    let fullImageUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorResult = await uploadResponse.json();
        console.error("Image upload failed:", errorResult.error);
        toast(`Image upload failed: ${errorResult.error || "Server error"}`);
        setLoading(false);
        return;
      }

      const uploadResult = await uploadResponse.json();
      imageUrl = uploadResult.imageUrl;
      fullImageUrl = uploadResult.fullUrl || window.location.origin + imageUrl;
      console.log("Image Uploaded to local server:", imageUrl);
      console.log("Full image URL:", fullImageUrl);
    } catch (error) {
      console.error("Error during image upload:", error);
      toast("Image upload failed due to a network or server issue.");
      setLoading(false);
      return;
    }

    const uid = uuid4();
    console.log(uid);
    // Save Info To Database without requiring user authentication
    try {
      const result = await axios.post("/api/wireframe-to-code", {
        uid: uid,
        description: description,
        imageUrl: imageUrl,
        model: model,
        email: "guest@example.com", // Default guest email
      });

      setLoading(false);
      router.push("/view-code/" + uid);
    } catch (error) {
      console.error("Error during code generation:", error);
      toast("Failed to generate code. Please try again.");
      setLoading(false);
    }
  };

  // Include suggested description as a component inside the wireframe preview
  const SuggestedDescriptionPanel = () => {
    if (!suggestedDescription) return null;

    return (
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-semibold text-blue-700 mb-1">
          AI-Generated Wireframe Analysis
        </h3>
        <p className="text-xs text-blue-800 mb-2">{suggestedDescription}</p>
        <Button
          variant="outline"
          size="sm"
          className="text-xs w-full"
          onClick={() => setDescription(suggestedDescription)}
        >
          Use This Description
        </Button>
      </div>
    );
  };

  return (
    <div className="mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {!previewUrl ? (
          <div
            className="p-7 border border-dashed rounded-md shadow-md
                flex flex-col items-center justify-center
                "
          >
            <CloudUpload className="h-10 w-10 text-primary" />
            <h2 className="font-bold text-lg">Upload Image</h2>

            <p className="text-gray-400 mt-2">
              Click Button Select Wireframe Image{" "}
            </p>
            <div className="p-5 border border-dashed w-full flex mt-4 justify-center">
              <label htmlFor="imageSelect">
                <h2 className="p-2 bg-blue-100 font-bold text-primary rounded-md px-5">
                  Select Image
                </h2>
              </label>
            </div>
            <input
              type="file"
              id="imageSelect"
              className="hidden"
              multiple={false}
              onChange={OnImageSelect}
            />
          </div>
        ) : (
          <div className="p-5 border border-dashed">
            <div className="relative">
              <Image
                src={previewUrl}
                alt="preview"
                width={500}
                height={500}
                className="w-full h-[250px] object-contain"
                unoptimized={true}
              />
              <X
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm cursor-pointer hover:bg-gray-100"
                onClick={() => setPreviewUrl(null)}
              />
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={generateWireframeDescription}
                disabled={isGeneratingDescription}
                className="text-xs"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2Icon className="h-3 w-3 animate-spin mr-1" />{" "}
                    Analyzing Wireframe
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" /> Analyze Wireframe
                  </>
                )}
              </Button>
            </div>

            {suggestedDescription && <SuggestedDescriptionPanel />}
          </div>
        )}
        <div className="p-7 border shadow-md rounded-lg">
          <h2 className="font-bold text-lg">Select AI Model</h2>
          <Select onValueChange={(value) => setModel(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {Constants?.AiModelList.map((model, index) => (
                <SelectItem value={model.name} key={index}>
                  <div className="flex items-center gap-2">
                    <Image
                      src={model.icon}
                      alt={model.name}
                      width={25}
                      height={25}
                    />
                    <h2> {model.name}</h2>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <h2 className="font-bold text-lg mt-7">
            Enter Description about your webpage
          </h2>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event?.target.value)}
            className="mt-3 h-[150px]"
            placeholder="Write about your web page or use the 'Analyze Wireframe' button for AI suggestions"
          />
        </div>
      </div>

      <div className="mt-32 flex items-center justify-center">
        <Button
          onClick={OnConverToCodeButtonClick}
          disabled={loading}
          className="py-6 px-8 text-lg"
        >
          {loading ? (
            <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
          ) : (
            <WandSparkles className="h-6 w-6 mr-2" />
          )}
          Convert to Code
        </Button>
      </div>
    </div>
  );
}

export default ImageUpload;
