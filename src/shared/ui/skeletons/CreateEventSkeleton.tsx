"use client";

import { Container } from "@/modules/shared/ui/core/Container";
import { Skeleton } from "@mui/material";

export default function CreateEventSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Container>
        <div className="absolute top-8">
          <Skeleton variant="text" width={100} height={40} />
        </div>
        <Skeleton
          variant="text"
          width="50%"
          height={50}
          className="mx-auto my-7"
        />

        <div className="flex flex-col gap-5 my-6">
          {/* Photo Upload skeleton */}
          <Skeleton variant="rectangular" height={200} className="rounded-lg" />

          {/* Name */}
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width={100} />
            <Skeleton
              variant="rectangular"
              height={40}
              className="rounded-lg"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width={120} />
            <Skeleton
              variant="rectangular"
              height={40}
              className="rounded-lg"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width={150} />
            <Skeleton
              variant="rectangular"
              height={40}
              className="rounded-lg"
            />
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="flex flex-col gap-1 w-1/2">
                <Skeleton variant="text" width={80} />
                <Skeleton
                  variant="rectangular"
                  height={40}
                  className="rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <Skeleton variant="text" width={80} />
                <Skeleton
                  variant="rectangular"
                  height={40}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Skeleton variant="text" width={140} />
            <Skeleton
              variant="rectangular"
              height={80}
              className="rounded-lg"
            />
          </div>

          {/* Button */}
          <Skeleton variant="rectangular" height={50} className="rounded-lg" />
        </div>
      </Container>
    </div>
  );
}
