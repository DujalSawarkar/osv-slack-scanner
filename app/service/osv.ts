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

    if (response.data && response.data.vulns) {
      return response.data.vulns;
    }

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
