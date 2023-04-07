import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showModal: false,
};

const modal_slice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    SHOW_MODAL: (state) => {
      state.showModal = true;
    },
    CLOSE_MODAL: (state) => {
      state.showModal = false;
    },
  },
});

export const { SHOW_MODAL, CLOSE_MODAL } = modal_slice.actions;

export const modalState = (state) => state.modal.showModal;

export default modal_slice.reducer;
