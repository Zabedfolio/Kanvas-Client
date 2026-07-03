import { create } from "zustand";
import { format } from "date-fns";

interface DateStore {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

export const useDateStore = create<DateStore>((set) => ({
    selectedDate: format(new Date(), "yyyy-MM-dd"),
    setSelectedDate: (date) => set({ selectedDate: date }),
}));
