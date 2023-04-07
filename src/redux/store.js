import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import authReducer from "./slices/auth.slice";
import filterReducer from "./slices/filter.slice";
import modalReducer from "./slices/modal.slice";

const rootReducer = combineReducers({
  auth: authReducer,
  filter: filterReducer,
  modal: modalReducer,
});

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
