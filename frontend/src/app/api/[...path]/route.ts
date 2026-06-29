import { NextRequest, NextResponse } from "next/server"

const DJANGO_API = (process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "")

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
])

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const joined = pathSegments.join("/")
  const djangoPath = joined.endsWith("/") ? joined : `${joined}/`
  const target = new URL(`${DJANGO_API}/${djangoPath}`)

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value)
  })

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  const djangoResponse = await fetch(target.toString(), init)
  const responseHeaders = new Headers()

  djangoResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value)
    }
  })

  return new NextResponse(djangoResponse.body, {
    status: djangoResponse.status,
    statusText: djangoResponse.statusText,
    headers: responseHeaders,
  })
}

type RouteContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}
