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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Scan History
              </h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Run New Scan
              </button>
            </div>
          </div>

          <div className="p-6">
            {history.length > 0 ? (
              <div className="space-y-4">
                {history
                  .slice()
                  .reverse()
                  .map((item: any, index: number) => {
                    const breakdown = getVulnerabilityBreakdown(
                      item.totalVulnerabilities
                    );
                    const scanDate = new Date(item.timestamp);

                    return (
                      <div
                        key={history.length - 1 - index}
                        className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            {getStatusIndicator(item.totalVulnerabilities)}
                            <div>
                              <p className="font-semibold text-gray-900">
                                Scan #{history.length - index}
                              </p>
                              <p className="text-sm text-gray-500">
                                {scanDate.toLocaleDateString()} at{" "}
                                {scanDate.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              {item.totalVulnerabilities}
                            </p>
                            <p className="text-sm text-gray-500">
                              Issues found
                            </p>
                          </div>
                        </div>

                        {item.totalVulnerabilities > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(breakdown).map(
                              ([severity, count]) =>
                                count > 0 && (
                                  <div
                                    key={severity}
                                    className={`px-3 py-2 rounded-lg border text-center ${getSeverityColor(
                                      severity
                                    )}`}
                                  >
                                    <p className="font-semibold text-lg">
                                      {count as number}
                                    </p>
                                    <p className="text-xs uppercase tracking-wide">
                                      {severity}
                                    </p>
                                  </div>
                                )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No scan history found
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Get started by running your first security scan. Update your
                  package.json or click the button above to trigger a new scan.
                </p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Run Your First Scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
