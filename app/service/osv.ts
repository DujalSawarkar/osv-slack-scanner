import axios from "axios";

interface Vulnerability {
  id: string;
  summary: string;
  details: string;
}

export async function scanPackage(
  packageName: string,
  version: string
): Promise<Vulnerability[]> {
  const payload = {
    version: version,
    package: {
      name: packageName,
      ecosystem: "npm",
    },
  };

  console.log(
    " Sending this payload to OSV:",
    JSON.stringify(payload, null, 2)
  );

  try {
    const response = await axios.post("https://api.osv.dev/v1/query", payload);

    // --- START OF NEW DEBUG LOGS ---
    console.log("Received raw response data:", response.data);
    console.log("Type of response.data:", typeof response.data);
    console.log(
      "Does response.data.vulns exist?",
      response.data.hasOwnProperty("vulns")
    );
    // --- END OF NEW DEBUG LOGS ---

    if (response.data && response.data.vulns) {
      console.log(
        ` Scan complete. Found ${response.data.vulns.length} vulnerabilities.`
      );
      return response.data.vulns;
    }

    console.log(` Scan complete. No vulnerabilities found.`);
    return [];
  } catch (error) {
    console.error(` FAILED to scan ${packageName}@${version}.`);
    if (axios.isAxiosError(error)) {
      console.error(
        "API Error Response:",
        error.response?.data || error.message
      );
    } else {
      console.error("Generic Error:", error);
    }
    return [];
  }
}
