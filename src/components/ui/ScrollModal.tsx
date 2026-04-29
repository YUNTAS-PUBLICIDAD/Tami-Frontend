import React from "react";
import { usePopupLogic, type PopupSettings } from "../../hooks/usePopupLogic";
import PopupForm from "./popups/PopupForm";

interface ScrollModalProps {
  isPreview?: boolean;
  initialSettings?: PopupSettings;
}

const ScrollModal = ({ isPreview = false, initialSettings }: ScrollModalProps) => {
  const logic = usePopupLogic({ isPreview, initialSettings });

  return (
    <PopupForm
      isPreview={isPreview}
      {...logic}
    />
  );
};

export default ScrollModal;