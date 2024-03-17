import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.EXPRESS_API_URL;

export const socket = io.connect(URL, {
  // autoConnect: false, //Hay lỗi chỗ này
});
