/**
 * Utilities for localStorage management
 */

import { HistoryItem } from "~/components/UnifiedHistoryList";
import { Chat } from "./ChatContext";

export interface StorageInfo {
  used: number;
  total: number;
  percentUsed: number;
}

/**
 * Get the amount of localStorage space used and available
 * @returns StorageInfo with used bytes, total bytes and percentage used
 */
export function getLocalStorageInfo(): StorageInfo {
  if (typeof window === "undefined") {
    return { used: 0, total: 0, percentUsed: 0 };
  }

  try {
    // Estimate localStorage size
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += (localStorage[key].length + key.length) * 2; // UTF-16 is 2 bytes per character
      }
    }

    // Convert to bytes and calculate percentages
    const quota = 5 * 1024 * 1024; // Most browsers allocate ~5MB
    const used = totalSize;
    const percentUsed = (used / quota) * 100;

    return {
      used,
      total: quota,
      percentUsed,
    };
  } catch (error) {
    console.error("Error calculating localStorage size:", error);
    return { used: 0, total: 0, percentUsed: 0 };
  }
}

// Save history items to localStorage
export function saveHistoryToStorage(historyItems: HistoryItem[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("askupi-history", JSON.stringify(historyItems));
  } catch (error) {
    console.error("Failed to save history to localStorage:", error);
  }
}

// Get history items from localStorage
export function getHistoryFromStorage(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const storedHistory = localStorage.getItem("askupi-history");
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (error) {
    console.error("Failed to load history from localStorage:", error);
    return [];
  }
}

// Save chats to localStorage
export function saveChatsToStorage(chats: Chat[]) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("askupi-chats", JSON.stringify(chats));
  } catch (error) {
    console.error("Failed to save chats to localStorage:", error);
  }
}

// Get chats from localStorage
export function getChatsFromStorage(): Chat[] {
  if (typeof window === "undefined") return [];

  try {
    const storedChats = localStorage.getItem("askupi-chats");
    return storedChats ? JSON.parse(storedChats) : [];
  } catch (error) {
    console.error("Failed to load chats from localStorage:", error);
    return [];
  }
}

// Clear storage (for debugging/testing)
export function clearAllStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("askupi-history");
    localStorage.removeItem("askupi-chats");
    console.log("All local storage cleared");
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}
