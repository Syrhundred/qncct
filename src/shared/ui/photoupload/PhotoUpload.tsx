"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

type UploadedImage = {
  file: File;
  preview: string;
};

export default function PhotoUpload() {
  const [cover, setCover] = useState<UploadedImage | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "extra",
  ) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = { file, preview: reader.result as string };

        if (type === "cover") {
          setCover(newImage);
        } else {
          setImages((prev) => [...prev, newImage]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Cover photo */}
      <label className="w-full h-40 border-2 bg-gradient border-dashed rounded-lg flex items-center justify-center cursor-pointer">
        <div className="bg-white w-full h-full rounded-lg flex items-center justify-center">
          {cover ? (
            <img
              src={cover.preview}
              alt="Cover"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Plus size={20} className="text-purple-700" />
              <span className="text-sm font-bold bg-gradient bg-clip-text text-transparent">
                Add cover photo
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "cover")}
          />
        </div>
      </label>

      <div className="grid grid-cols-3 gap-4">
        {[...images, null, null, null].slice(0, 3).map((img, index) => (
          <label
            key={index}
            className="aspect-square w-full border-2 bg-gradient border-dashed rounded-lg flex items-center justify-center cursor-pointer"
          >
            <div className="bg-white w-full h-full rounded-lg flex items-center justify-center">
              {img ? (
                <img
                  src={img.preview}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Plus className="text-purple-700" size={24} />
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, "extra")}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
