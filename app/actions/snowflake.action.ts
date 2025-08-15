"use server"

import { HttpStatusCode } from "axios";

export default async function unifiedApiCall(prompt: string) {
  const service = process.env.OPTED_SERVICE!;

  // Validate OPTED_SERVICE
  if (!service || !["AWS", "NEXTJS"].includes(service)) {
    return {
      data: "",
      status: HttpStatusCode.BadRequest,
      success: false,
      message: "Invalid or missing OPTED_SERVICE env variable"
    };
  }

  // Pick endpoint based on service
  let endpoint: string | undefined;
  if (service === "AWS") {
    endpoint = process.env.AWS_API_GATEWAY_REST_ENDPOINT;
    if (!endpoint) {
      return {
        data: "",
        status: HttpStatusCode.BadRequest,
        success: false,
        message: "AWS_API_GATEWAY_REST_ENDPOINT is not set."
      };
    }
  } else if (service === "NEXTJS") {
    endpoint = process.env.CORTEX_AGENT_API_PATH;
    if (!endpoint) {
      return {
        data: "",
        status: HttpStatusCode.BadRequest,
        success: false,
        message: "CORTEX_AGENT_API_PATH is not set."
      };
    }
  }

  const payload =
    service === "AWS" ? { prompts: [prompt] } : { prompt };

  const result = await fetch(endpoint!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const output = await result.json();
  const data = 
    service === "AWS" ? output.results : output;

  if (!data) {
    return {
      data: "",
      status: HttpStatusCode.InternalServerError,
      success: false
    };
  }

  return {
    data: data,
    status: HttpStatusCode.Accepted,
    success: true
  };
}
