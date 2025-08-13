import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

const ASSET_URL_PREFIXES = [
  "/static/",
  "/api/",
  "/favicon.ico",
  "/assets/",
];

export async function GET(request: NextRequest) {
  return handleProxy(request);
}
export async function POST(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  const pat = process.env.OPENMETADATA_PAT;
  const openMetaDataBaseUri = process.env.OPENMETADATA_BASE_URI;

  if (!openMetaDataBaseUri || !pat) {
    return NextResponse.json(
      { error: "OPENMETADATA env variables not set" },
      { status: HttpStatusCode.BadRequest }
    );
  }

  const url = new URL(request.url);
  const targetPath = url.pathname.replace("/api/openmetadata/proxy", "");
  const targetUrl = `${openMetaDataBaseUri}${targetPath}`;

  try {
    const headersObj = Object.fromEntries(request.headers);
    delete headersObj.host;
    headersObj.authorization = `Bearer ${pat}`;

    console.debug(`[Proxy] Request to: ${targetUrl}, method: ${request.method}`);
    console.debug(`[Proxy] Forwarded headers:`, headersObj);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headersObj,
      body: request.body,
    });

    if (!response.ok) {
      console.error(`[Proxy] Response error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        {
          error:
            response.status === HttpStatusCode.TooManyRequests
              ? "Rate limit exceeded"
              : "Internal server error",
        },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    // Rewrite only if HTML (text/html)
    if (contentType.includes("text/html")) {
      console.debug("[Proxy] Rewriting HTML content");

      let html = Buffer.from(buffer).toString("utf-8");
      // Rewrite asset URLs to route through proxy
      ASSET_URL_PREFIXES.forEach((prefix) => {
        // Replace src/href="/static/..." or "/api/..." etc with proxy path
        const regex = new RegExp(`(src|href)=["']${prefix}`, "g");
        html = html.replace(regex, `$1="/api/openmetadata/proxy${prefix}`);
      });

      return new NextResponse(html, {
        status: response.status,
        headers: {
          "content-type": contentType,
        },
      });
    }

    // For other content types (JS, CSS, images, JSON), just proxy as is
    return new NextResponse(Buffer.from(buffer), {
      status: response.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (err) {
    console.error("Proxy error: ", err);
    return NextResponse.json(
      {
        error: "Proxy request failed",
      },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
