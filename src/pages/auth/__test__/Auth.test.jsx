import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import Auth from "../Auth";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "../../../redux/store";
import { expect } from "vitest";
import "@testing-library/jest-dom/extend-expect";

it("shows username field only when in register state", async () => {
  render(
    <MemoryRouter>
      <Provider store={store}>
        <Auth />
      </Provider>
    </MemoryRouter>
  );

  const registerBtn = screen.queryByText(/register/i);
  await waitFor(() => {
    expect(registerBtn).toBeInTheDocument();
  });
  fireEvent.click(registerBtn);

  const usernameField = screen.queryByPlaceholderText(/enter your username/i);
  expect(usernameField).toBeInTheDocument();
});

it("dosen't show the avatar upload input when in login state", async () => {
  render(
    <MemoryRouter>
      <Provider store={store}>
        <Auth />
      </Provider>
    </MemoryRouter>
  );

  const loginBtn = screen.queryByText(/register/i);
  const avatarInput = screen.queryByTestId("avatar-input");
  await waitFor(() => {
    expect(loginBtn).toBeInTheDocument();
  });
  fireEvent.click(loginBtn);
  expect(avatarInput).not.toBeInTheDocument();
});
