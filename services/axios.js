import axios from "axios";
import { SERVER_URL } from "../utils/variables";

export const httpRequest = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});
