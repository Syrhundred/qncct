"use client";

import { Plus } from "lucide-react";
import React, { type FC } from "react";
import Image from "next/image";

type UploadedImage = {
  file: File;
};

type PhotoUploadProps = {
  cover: UploadedImage | null;
  images: UploadedImage[];
  onCoverChange: (cover: UploadedImage) => void;
  onImagesChange: (imgs: UploadedImage[]) => void;
};

const PhotoUpload: FC<PhotoUploadProps> = ({
  cover,
  images,
  onCoverChange,
  onImagesChange,
}) => {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "extra",
  ) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const newImage = { file };

      if (type === "cover") {
        onCoverChange(newImage);
      } else {
        onImagesChange([...images, newImage]);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Cover photo */}
      <label className="w-full h-40 border-2 bg-gradient border-dashed rounded-lg flex items-center justify-center cursor-pointer">
        <div className="bg-white w-full h-full rounded-lg flex items-center justify-center">
          {cover?.file ? (
            <Image
              src={URL.createObjectURL(cover.file)}
              height={1000}
              width={1000}
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

      {/* Additional photos */}
      <div className="grid grid-cols-3 gap-4">
        {[...images, null, null, null].slice(0, 3).map((img, index) => (
          <label
            key={index}
            className="aspect-square w-full border-2 bg-gradient border-dashed rounded-lg flex items-center justify-center cursor-pointer"
          >
            <div className="bg-white w-full h-full rounded-lg flex items-center justify-center">
              {img ? (
                <Image
                  width={1000}
                  height={1000}
                  src={URL.createObjectURL(img.file)}
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
};

export default PhotoUpload;
