"use client";

import { ReactNode, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export const BottomSheet = ({ isOpen, onClose, children, title }: Props) => {
  const dragControls = useDragControls();
  const sheetRef = useRef(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* bottom sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-4 pt-2 h-[80vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
          >
            {/* Граббер — кликабельный и drag-enabled */}
            <motion.div
              className="mx-auto mb-4 mt-2 h-1.5 w-12 rounded-full bg-gray-300 cursor-pointer touch-none"
              onPointerDown={(e) => dragControls.start(e)}
            />

            {/* Title (optional) */}
            {title && (
              <h3 className="text-center font-semibold text-[18px] mb-4">
                {title}
              </h3>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
