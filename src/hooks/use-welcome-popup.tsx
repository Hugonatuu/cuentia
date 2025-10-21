'use client';

import { create } from 'zustand';
import { createContext, useContext, ReactNode, useRef } from 'react';

type WelcomePopupState = {
  isPopupOpen: boolean;
  onCloseCallback: (() => void) | null;
  showPopup: (callback: () => void) => void;
  closePopup: () => void;
};

// Create the zustand store
const useWelcomePopupStore = create<WelcomePopupState>((set, get) => ({
  isPopupOpen: false,
  onCloseCallback: null,
  showPopup: (callback) => {
    set({ isPopupOpen: true, onCloseCallback: callback });

    // Automatically close after 1.5 seconds and then run callback
    setTimeout(() => {
        get().closePopup();
    }, 1500); // Popup visible for 1.5 seconds
  },
  closePopup: () => {
    const { isPopupOpen, onCloseCallback } = get();
    // Only proceed if the popup is actually open
    if(isPopupOpen) {
        set({ isPopupOpen: false, onCloseCallback: null });
        if (onCloseCallback) {
            onCloseCallback();
        }
    }
  },
}));

// Create a React Context
const WelcomePopupContext = createContext<ReturnType<typeof useWelcomePopupStore> | undefined>(
  undefined
);

// Create a provider component
export const WelcomePopupProvider = ({ children }: { children: ReactNode }) => {
  const store = useRef(useWelcomePopupStore()).current;
  return (
    <WelcomePopupContext.Provider value={store}>
      {children}
    </WelcomePopupContext.Provider>
  );
};

// Create a hook to use the context
export const useWelcomePopup = () => {
  const context = useContext(WelcomePopupContext);
  if (context === undefined) {
    throw new Error('useWelcomePopup must be used within a WelcomePopupProvider');
  }
  return context;
};
