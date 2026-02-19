
export async function apiReportRobot(robotId: string) {
  let res: Response;
  try {
    res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ robotId }),
    });
  } catch (e) {
    console.log("2: fetch threw (network error):", e);
    throw e;
  }
  const raw = await res.text();

  if (!res.ok) throw new Error(raw || "Report robot failed");
  return raw ? JSON.parse(raw) : null;
}