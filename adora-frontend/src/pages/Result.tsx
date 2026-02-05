import { useEffect, useState } from "react";
import { dummyGenerations } from "../assets/assets";
import type { Project } from "../types";
import { Loader2Icon, RefreshCwIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Result = () => {
  const [projects, setProjects] = useState<Project>({} as Project);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjectsData = async () => {
    setTimeout(() => {
      setProjects(dummyGenerations[0]);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  return loading ? (
    <div className="h-screen w-full flex  items-center justify-center">
      <Loader2Icon className="animate-spin text-indigo-500 size-9" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-20">
      <div className="max-w-6xl mx-auto">
        {/* header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-medium">
            Generation Result
          </h1>
          <Link
            className="btn-secondary text-sm flex items-center gap-2"
            to={"/generate"}
          >
            <RefreshCwIcon className=" w-4 h-4" />
            <p className="max-sm:hidden">New Generation</p>
          </Link>
        </header>

        {/* grid layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* main result display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div
                className={`${projects?.aspectRatio === "9:16" ? "aspect-9/16" : "aspect-video"} sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden relative`}
              >
                {projects?.generatedVideo ? (
                  <video
                    src={projects.generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={projects.generatedImage}
                    alt="Generated Result"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* side action */}
        </div>
      </div>
    </div>
  );
};

export default Result;
