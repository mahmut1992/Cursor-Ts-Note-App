import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Not tipi tanımı
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

// Başlangıç durumu
interface NoteState {
  notes: Note[];
}

const initialState: NoteState = {
  notes: [],
};

// Note slice oluşturma
const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    // Yeni not ekleme
    createNote: {
      reducer: (state, action: PayloadAction<Note>) => {
        state.notes.push(action.payload);
      },
      prepare: (note: Omit<Note, "id">) => ({
        payload: {
          ...note,
          id: uuidv4(),
        },
      }),
    },

    // Notu güncelleme
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(
        (note) => note.id === action.payload.id
      );
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },

    // Notu silme
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter((note) => note.id !== action.payload);
    },
  },
});

// Action ve reducer'ları export etme
export const { createNote, updateNote, deleteNote } = noteSlice.actions;
export default noteSlice.reducer;
