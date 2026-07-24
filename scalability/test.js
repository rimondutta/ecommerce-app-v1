import http from "k6/http";

export const options = {
  vus: 1000,
  duration: "30s",
};

export default function loadTest() {
  http.get("https://toyhourse.vercel.app");
}