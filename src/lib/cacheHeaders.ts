import { NextResponse } from "next/server";

export function addCacheHeaders(
  response: NextResponse,
  maxAge = 60
): NextResponse {
  response.headers.set(
    "Cache-Control",
    `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  return response;
}

export function addPrivateCacheHeaders(
  response: NextResponse,
  maxAge = 30
): NextResponse {
  response.headers.set(
    "Cache-Control",
    `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
  );
  return response;
}

export function noCacheResponse(
  body: any,
  status = 200
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
