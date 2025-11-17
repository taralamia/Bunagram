import { getBaseHandler, checkHandler } from "../controller/anagramController";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",            
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
function optionsResponse() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
function notFoundResponse() {
  return new Response("Not found", { status: 404, headers: CORS_HEADERS });
}
async function addCorsToResponse(res: Response): Promise<Response> {
  if (res.headers.get("Access-Control-Allow-Origin")) return res;
  const text = await res.text().catch(() => "");
  const headersObj: Record<string, string> = {};
  for (const [k, v] of res.headers) headersObj[k.toLowerCase()] = v;
  if (!headersObj["content-type"]) headersObj["content-type"] = "application/json";
  Object.assign(headersObj, CORS_HEADERS);
  return new Response(text, {
    status: res.status,
    statusText: res.statusText,
    headers: headersObj,
  });
}
export function anagramRoutesFactory() {
  return async function handler(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;
    if (req.method === "OPTIONS") {
      return optionsResponse();
    }
    if (req.method === "GET" && (path === "/api/pick")) {
      const res = await getBaseHandler(req);
      return addCorsToResponse(res);
    }
    if (req.method === "POST" && (path === "/api/check")) {
      const res = await checkHandler(req);
      return addCorsToResponse(res);
    }
    return notFoundResponse();
  };
}
