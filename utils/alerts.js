import toast from "react-hot-toast";

export const successToast = (payload) => {
  return toast.success(payload, {
    duration: 4000,
  });
};

export const errorToast = (payload) => {
  return toast.error(payload, {
    duration: 4000,
  });
};
