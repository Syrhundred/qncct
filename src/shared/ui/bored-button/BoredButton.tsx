"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BoredButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    });
  };

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const position = await getLocation();
      const { latitude, longitude } = position.coords;

      router.push(`/bored-events?lat=${latitude}&lon=${longitude}`);
    } catch (error) {
      console.error("Error:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className="fixed bottom-24 right-0 bg-gradient-to-r from-pink-500 to-orange-500
               text-white font-bold py-4 px-6 rounded-full shadow-xl hover:shadow-2xl
               transition-all duration-300 flex items-center gap-2 z-[999]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <Loader2 className="animate-spin h-6 w-6" />
      ) : (
        <>
          <Sparkles className="h-6 w-6" />
          <span>I am Bored!</span>
        </>
      )}
    </motion.button>
  );
};

export default BoredButton;
