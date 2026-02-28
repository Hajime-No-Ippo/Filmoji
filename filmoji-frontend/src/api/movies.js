// This function asks the backend for movies via the Vite proxy.
// Because of the proxy, "/api" is forwarded to "http://localhost:8080".
export async function fetchMovies() {
  const res = await fetch("/api/movies");

  // If the backend returns an error (like 500 or 404), this catches it clearly.
  if (!res.ok) {
    throw new Error(`Failed to fetch movies (HTTP ${res.status})`);
  }

  // Convert the JSON response into a JavaScript object/array.
  return res.json();
}