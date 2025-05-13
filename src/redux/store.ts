import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage için
import noteReducer from "./slices/noteSlice";

// Persist konfigürasyonu
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["notes"], // Sadece notes slice'ını kalıcı hale getir
};

// Root reducer
const rootReducer = combineReducers({
  notes: noteReducer,
});

// Persist edilmiş reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store yapılandırması
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Redux Persist ile çalışabilmek için non-serializable değerleri yoksay
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// RootState ve AppDispatch tipleri
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
