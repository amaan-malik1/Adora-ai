import React, { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import {
  Loader2Icon,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  Wand2Icon,
} from "lucide-react";
import { PrimaryButton } from "../components/Buttons";

const Generate = () => {
  // const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [productImg, setProductImg] = useState<File | null>(null);
  const [modelImg, setModelImg] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model",
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "product") {
        setProductImg(e.target.files[0]);
      } else {
        setModelImg(e.target.files[0]);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your modal and product image to generate stunning UGC, short-form videos and social media post"
        />
        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/* left col */}
          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone
              label="Product Image"
              file={productImg}
              onClear={() => {
                setProductImg(null);
              }}
              onChange={(e) => {
                handleFileChange(e, "product");
              }}
            />
            <UploadZone
              label="Model Image"
              file={modelImg}
              onClear={() => {
                setModelImg(null);
              }}
              onChange={(e) => {
                handleFileChange(e, "model");
              }}
            />
          </div>

          {/* right col */}
          <div className="w-full">
            {/* product Name */}
            <div className="mb-4 text-gray-300">
              <label htmlFor="name" className="block text-sm mb-4">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Name your project"
                required
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>

            {/* product Description */}
            <div className="mb-4 text-gray-300">
              <label htmlFor="productDesc" className="block text-sm mb-4">
                Project Description{" "}
                <span className="text-xs text-violet-400">(Optional)</span>
              </label>
              <textarea
                id="productDesc"
                rows={4}
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                placeholder="Describe your project"
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none transition-all"
              />
            </div>

            {/* aspect ration */}
            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Aspect Ratio</label>

              <div className="flex gap-3">
                <RectangleVerticalIcon
                  onClick={() => setAspectRatio("9:16")}
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />

                <RectangleHorizontalIcon
                  onClick={() => setAspectRatio("16:9")}
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />
              </div>
            </div>

            {/* User Prompt */}
            <div className="mb-4 text-gray-300">
              <label htmlFor="userPrompt" className="block text-sm mb-4">
                User Prompt{" "}
                <span className="text-xs text-violet-400">(optional)</span>
              </label>

              <textarea
                id="userPrompt"
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Describe how you want the narration to be."
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-10">
          <PrimaryButton
            disabled={isGenerating}
            className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="size-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2Icon className="size-5" />
                Generate Image
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
      <div></div>
    </div>
  );
};

export default Generate;
