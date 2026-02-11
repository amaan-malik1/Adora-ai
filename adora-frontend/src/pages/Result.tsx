import { useEffect, useState } from "react";
import type { Project } from "../types";
import {
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparkleIcon,
  VideoIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import apiInstance from "../config/axios";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";

const Result = () => {
  const [projects, setProjectsData] = useState<Project>({} as Project);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const { projectId } = useParams();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const fetchProjectsData = async () => {
    try {
      const token = await getToken();
      const { data } = await apiInstance.get(`/api/user/result/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectsData(data.projects);
      setLoading(false);
      setIsGenerating(data.projects.isGenerating);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }

      console.log("Error while fetching video data:", error);
    }
  };

  useEffect(() => {
    if (user && !projects.id) {
      fetchProjectsData();
    } else if (isLoaded && !user) {
      navigate("/");
    }
  }, [user]);

  //fecth data every 10 sec
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProjectsData();
    }, 10000);

    return () => clearInterval(interval);
  }, [user, isGenerating]);

  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      const token = await getToken();
      const { data } = await apiInstance.post(
        `/api/user/video/`,
        { projectId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setProjectsData((prev) => ({
        ...prev,
        generatedVideo: data.videoURL,
        isGenerating: false,
      }));

      toast.success(data.message);
      setIsGenerating(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Something went wrong");
      } else {
        toast.error("Unexpected error occurred");
      }

      console.log("Error while generating video:", error);
    }
  };

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

          {/* right side action */}
          <div className="space-y-6">
            {/* Download buttons */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-semibold gap-3">Actions</h3>
              <div className="flex flex-col gap-3">
                <a href={projects.generatedImage} download>
                  <GhostButton
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!projects.generatedImage}
                  >
                    <ImageIcon className="size-4.5" />
                    Download Image
                  </GhostButton>
                </a>
                <a href={projects.generatedVideo} download>
                  <GhostButton
                    className="w-full justify-center rounded-md py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!projects.generatedVideo}
                  >
                    <VideoIcon className="size-4.5" />
                    Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/* generate video button */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <VideoIcon className="size-24" />
              </div>
              <h3 className="flex text-xl font-semibold mb-2">Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6">
                Turn this static image into the dynamic video for social media.
              </p>
              {!projects.generatedVideo ? (
                <PrimaryButton
                  onClick={handleGenerateVideo}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <div> Generating video...</div>
                  ) : (
                    <>
                      <SparkleIcon className="size-4" />
                      Generate Video
                    </>
                  )}
                </PrimaryButton>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm font-medium ">
                  Video generated successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
