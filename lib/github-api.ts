export type GitHubRepo = {
  id: number;
  full_name: string;
  private: boolean;
  html_url: string;
};

async function ghFetch<T>(url: string, accessToken: string): Promise<T> {
  console.log("[ghFetch] URL:", url);
  const res = await fetch(url, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${accessToken}`,
      "user-agent": "osv-dashboard",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[ghFetch] GitHub API error`, res.status, body);
    throw new Error(`GitHub API ${res.status}: ${body || res.statusText}`);
  }

  const json = await res.json();
  console.log(
    "[ghFetch] Response for",
    url,
    JSON.stringify(json).slice(0, 500)
  );
  return json as T;
}

export async function canAccessRepo(
  accessToken: string,
  fullName: string
): Promise<boolean> {
  try {
    await ghFetch(`https://api.github.com/repos/${fullName}`, accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function listRepos(accessToken: string): Promise<GitHubRepo[]> {
  try {
    // Grab up to ~200 most recently updated repos the user can access.
    const page1 = await ghFetch<GitHubRepo[]>(
      "https://api.github.com/user/repos?per_page=100&sort=updated",
      accessToken
    );
    const page2 = await ghFetch<GitHubRepo[]>(
      "https://api.github.com/user/repos?per_page=100&sort=updated&page=2",
      accessToken
    );
    return [...page1, ...page2];
  } catch (e) {
    console.error("[listRepos] Error:", e);
    throw e;
  }
}
