import { useEffect, RefObject } from "react";

interface UseMobileMenuAccessibilityOptions {
  isOpen: boolean;
  onClose: () => void;
  overlayRef: RefObject<HTMLDivElement | null>;
  initialFocusIndex?: number;
}

/**
 * Custom hook to handle mobile menu accessibility features:
 * - Traps focus within the menu when open
 * - Closes menu on Escape key press
 * - Prevents body scroll when menu is open
 * - Auto-focuses the first navigation button when opened
 *
 * @param options - Configuration options for the hook
 * @param options.isOpen - Whether the mobile menu is currently open
 * @param options.onClose - Callback function to close the menu
 * @param options.overlayRef - Ref to the overlay container element
 * @param options.initialFocusIndex - Index of the button to focus initially (default: 1 to skip close button)
 */
export const useMobileMenuAccessibility = ({
  isOpen,
  onClose,
  overlayRef,
  initialFocusIndex = 1,
}: UseMobileMenuAccessibilityOptions): void => {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) {
        return;
      }

      const focusableElements = overlay.querySelectorAll("button");
      if (!focusableElements.length) {
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        // Shift+Tab: move focus backwards, wrap from first to last
        if (!activeElement || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move focus forwards, wrap from last to first
        if (!activeElement || activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus the specified button (skip close button by default)
    const navButtons = overlayRef.current?.querySelectorAll("button");
    if (navButtons && navButtons.length > initialFocusIndex) {
      (navButtons[initialFocusIndex] as HTMLButtonElement).focus();
    } else if (navButtons && navButtons.length > 0) {
      (navButtons[0] as HTMLButtonElement).focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore original body scroll behavior
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, overlayRef, initialFocusIndex]);
};
