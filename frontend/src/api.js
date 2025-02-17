import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Certifique-se de que essa URL está correta!
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;