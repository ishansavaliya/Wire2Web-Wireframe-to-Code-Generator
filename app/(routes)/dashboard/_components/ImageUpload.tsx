"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload, Loader2Icon, WandSparkles, X } from "lucide-react";
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
// Firebase storage imports removed
import axios from "axios";
// import { uuid } from 'drizzle-orm/pg-core'; // Removed unused import
import { useAuthContext } from "@/app/provider";
import { useRouter } from "next/navigation";
import Constants from "@/data/Constants";
import { toast } from "sonner";
function ImageUpload() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<any>();
  const [model, setModel] = useState<string>();
  const [description, setDescription] = useState<string>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const OnImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      console.log(files[0]);
      const imageUrl = URL.createObjectURL(files[0]);
      setFile(files[0]);
      setPreviewUrl(imageUrl);
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
      console.log("Image Uploaded to local server:", imageUrl);
    } catch (error) {
      console.error("Error during image upload:", error);
      toast("Image upload failed due to a network or server issue.");
      setLoading(false);
      return;
    }

    const uid = uuid4();
    console.log(uid);
    // Save Info To Database
    const result = await axios.post("/api/wireframe-to-code", {
      uid: uid,
      description: description,
      imageUrl: imageUrl,
      model: model,
      email: user?.email,
    });
    if (result.data?.error) {
      console.log("Not Enough credits");
      toast("Not Enough Credits!");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/view-code/" + uid);
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
                <h2 className="p-2 bg-blue-100 font-bold text-primary  rounded-md px-5">
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
            <Image
              src={previewUrl}
              alt="preview"
              width={500}
              height={500}
              className="w-full h-[250px] object-contain"
            />
            <X
              className="flex ite justify-end w-full cursor-pointer"
              onClick={() => setPreviewUrl(null)}
            />
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
            onChange={(event) => setDescription(event?.target.value)}
            className="mt-3 h-[150px]"
            placeholder="Write about your web page"
          />
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <Button onClick={OnConverToCodeButtonClick} disabled={loading}>
          {loading ? (
            <Loader2Icon className=" animate-spin" />
          ) : (
            <WandSparkles />
          )}
          Convert to Code
        </Button>
      </div>
    </div>
  );
}

export default ImageUpload;
