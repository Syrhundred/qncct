import SmallButton from "@/modules/shared/ui/button/SmallButton";

export default function Modal({
  modalText,
  modalTitle,
  onClose,
  onConfirm,
}: {
  modalText: string;
  modalTitle: string;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  return (
    <div className="fixed bg-black bg-opacity-50 top-0 left-0 w-full h-full flex items-center justify-center p-3">
      <div className="w-5/6 flex flex-col gap-6 p-3 bg-white rounded-2xl items-center">
        <h3 className="font-[700]">{modalTitle}</h3>
        <p className="text-center text-xs max-w-[250px] opacity-60 text-secondary">
          {modalText}
        </p>
        <div className="w-full flex gap-2 items-center">
          <button
            onClick={onClose}
            className={`rounded-lg border border-purple-700 bg-white w-1/2 py-3 text-purple-700 text-xs`}
          >
            Cancel
          </button>
          <SmallButton
            onClick={onConfirm}
            size="w-1/2 py-[13px]"
            buttonText={"Confirm"}
          />
        </div>
      </div>
    </div>
  );
}
