"use client";

import { ReactNode, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

// To fix the serialization error, we need to move the component logic into a client component
// but keep the parent component as a simple wrapper

// This is the client component with all the logic
function BottomSheetClient({
  isOpen,
  onClose,
  children,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
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
            {/* Drag handle */}
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
}

// This is the public component which will be imported by other components
// It must only have serializable props
export function BottomSheet({
  isOpen,
  onCloseAction,
  children,
  title,
}: {
  isOpen: boolean;
  onCloseAction: string; // Use a string identifier instead of a function
  children: ReactNode;
  title?: string;
}) {
  // Convert the action string to a function
  const handleClose = () => {
    // Dispatch a custom event that parent components can listen for
    const event = new CustomEvent("bottomsheet:close", {
      detail: { action: onCloseAction },
    });
    window.dispatchEvent(event);
  };

  return (
    <BottomSheetClient isOpen={isOpen} onClose={handleClose} title={title}>
      {children}
    </BottomSheetClient>
  );
}
