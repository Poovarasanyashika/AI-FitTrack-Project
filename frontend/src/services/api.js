const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const TOKEN_KEY = "aifittrack_poovarasan_token";

export const getToken = () =>
  localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return {
    success: response.ok,
    message: text || response.statusText,
  };
}

export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body,
    auth = true,
    signal,
  } = {}
) {
  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers,
        signal,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    const networkError = new Error(
      "Unable to connect to AI FitTrack server"
    );

    networkError.status = 0;

    throw networkError;
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Request failed (${response.status})`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}