import axios from "axios";

// IMPORTANT: Update VITE_API_BASE_URL in the .env file to match the port
// your ASP.NET Core API runs on (check the URL Swagger opens at, e.g.
// https://localhost:7001 or http://localhost:5000), then append /api.
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://localhost:63429/api";

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Casing bridge ---------------------------------------------------------
// ASP.NET Core's default System.Text.Json options serialize/deserialize JSON
// using camelCase (e.g. C# "Department_ID" becomes "department_ID" on the
// wire), even though the C# model properties are PascalCase. The rest of
// this app is written against the C# model names (Department_ID, Full_Name,
// etc.), so these interceptors translate transparently at the HTTP boundary:
// outgoing request bodies get their first letter lowercased per key, and
// incoming response bodies get their first letter uppercased per key.
const isPlainObject = (val) =>
  val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date);

function transformKeys(data, transformKey) {
  if (Array.isArray(data)) {
    return data.map((item) => transformKeys(item, transformKey));
  }
  if (isPlainObject(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [transformKey(key), transformKeys(value, transformKey)])
    );
  }
  return data;
}

const toCamelKey = (key) => key.charAt(0).toLowerCase() + key.slice(1);
const toPascalKey = (key) => key.charAt(0).toUpperCase() + key.slice(1);

apiClient.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformKeys(config.data, toCamelKey);
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  if (response.data) {
    response.data = transformKeys(response.data, toPascalKey);
  }
  return response;
});
// ----------------------------------------------------------------------------

export default apiClient;
