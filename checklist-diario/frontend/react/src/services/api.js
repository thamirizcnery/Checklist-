export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Sem conexão com o servidor", 0, "NETWORK_ERROR");
  }

  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new ApiError(error?.message ?? "Erro inesperado", response.status, error?.code);
  }
  return body;
}

export const api = {
  listActivities: () => request("/activities?pageSize=100"),
  createActivity: (name) =>
    request("/activities", { method: "POST", body: JSON.stringify({ name }) }),
  renameActivity: (id, name) =>
    request(`/activities/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  removeActivity: (id) => request(`/activities/${id}`, { method: "DELETE" }),
  reorderActivities: (ids) =>
    request("/activities/order", { method: "PUT", body: JSON.stringify({ ids }) }),
  listDays: (page = 1, pageSize = 30) => request(`/days?page=${page}&pageSize=${pageSize}`),
  getDay: (date) => request(`/days/${date}`),
  getToday: () => request("/days/today"),
  check: (activityId) => request(`/days/today/checks/${activityId}`, { method: "PUT" }),
  uncheck: (activityId) => request(`/days/today/checks/${activityId}`, { method: "DELETE" }),
};
