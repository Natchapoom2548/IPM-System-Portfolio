let isLoggingOut = false;

export async function apiFetch(input: string | Request, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : (input instanceof Request ? input.url : "");
  
  let newInit = { ...(init || {}) };
  if (url.includes("/api/")) {
    const savedUser = localStorage.getItem("current_user_v1");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.token) {
          let headers = newInit.headers || {};
          
          if (headers instanceof Headers) {
            headers.set("Authorization", `Bearer ${user.token}`);
          } else if (Array.isArray(headers)) {
            const hasAuth = headers.some(h => h[0].toLowerCase() === "authorization");
            if (!hasAuth) {
              headers.push(["Authorization", `Bearer ${user.token}`]);
            }
          } else {
            const hasAuth = Object.keys(headers).some(k => k.toLowerCase() === "authorization");
            if (!hasAuth) {
              headers = {
                ...headers,
                "Authorization": `Bearer ${user.token}`
              };
            }
          }
          newInit.headers = headers;
        }
      } catch (e) {
        console.error("Error setting Authorization header", e);
      }
    }
  }
  
  const response = await fetch(input, newInit);
  
  // Handle automatic session expiration logout
  if (response.status === 401 && !url.includes("/api/login") && !url.includes("/api/health")) {
    const savedUser = localStorage.getItem("current_user_v1");
    if (savedUser && !isLoggingOut) {
      isLoggingOut = true;
      console.warn("Session expired or unauthorized. Logging out...");
      localStorage.removeItem("current_user_v1");
      window.location.reload();
    }
  }
  
  return response;
}
