import React, { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";

const Generate = () => {
  const [name, setName] = useState("");
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

  const handleGenarate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenarate} className="mx-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your modal and product image to generate stunning UGC, short-form videos and social media post"
        />
        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/* left col */}
          <div className="">
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
          <div>
            <p>Right</p>
          </div>
        </div>
      </form>
      <div></div>
    </div>
  );
};

export default Generate;
