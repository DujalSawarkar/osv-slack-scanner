import fs from "fs/promises";
import path from "path";

async function getScanHistory() {
  try {
    const historyPath = path.resolve("./scan-history.json");
    const data = await fs.readFile(historyPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Mock function to simulate vulnerability severity breakdown
function getVulnerabilityBreakdown(total: number) {
  if (total === 0) return { critical: 0, high: 0, medium: 0, low: 0 };

  // Simulate distribution
  const critical = Math.floor(total * 0.1);
  const high = Math.floor(total * 0.2);
  const medium = Math.floor(total * 0.4);
  const low = total - critical - high - medium;

  return { critical, high, medium, low };
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "text-red-600 bg-red-50 border-red-200";
    case "high":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "medium":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "low":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

function getStatusIndicator(vulnerabilities: number) {
  if (vulnerabilities === 0) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-600 font-semibold">Secure</span>
      </div>
    );
  } else if (vulnerabilities < 5) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-yellow-600 font-semibold">Low Risk</span>
      </div>
    );
  } else if (vulnerabilities < 15) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
        <span className="text-orange-600 font-semibold">Medium Risk</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-600 font-semibold">High Risk</span>
      </div>
    );
  }
}

export default async function DashboardPage() {
  const history = await getScanHistory();

  // Calculate summary statistics
  const totalScans = history.length;
  const latestScan = history[history.length - 1];
  const averageVulnerabilities =
    history.length > 0
      ? Math.round(
          history.reduce(
            (sum: number, scan: any) => sum + scan.totalVulnerabilities,
            0
          ) / history.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Security Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor your application's vulnerability status and scan history
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Scans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-3xl font-bold text-gray-900">{totalScans}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Latest Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Status
                </p>
                <div className="mt-2">
                  {latestScan ? (
                    getStatusIndicator(latestScan.totalVulnerabilities)
                  ) : (
                    <span className="text-gray-400">No scans yet</span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Latest Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Latest Issues
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {latestScan ? latestScan.totalVulnerabilities : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Issues */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Issues
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageVulnerabilities}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Scan History
            </h2>
          </div>
          <div className="p-6">
            {history.length > 0 ? (
              <div className="space-y-6">
                {history
                  .slice()
                  .reverse()
                  .map((scan: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Scan #{history.length - index}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(scan.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-right font-bold text-lg">
                            {scan.totalVulnerabilities}
                          </p>
                          <p className="text-sm text-gray-500">Issues</p>
                        </div>
                      </div>

                      {/* Displays the list of packages */}
                      {scan.packages && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Packages Scanned
                          </h4>
                          <ul className="list-disc pl-5 mt-1 text-sm text-gray-700">
                            {scan.packages.map((pkg: string, i: number) => (
                              <li key={i}>{pkg}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No scan history found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
