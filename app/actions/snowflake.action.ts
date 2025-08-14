import { connection } from 'next/server'
import { HttpStatusCode } from "axios";

export async function continueConversationWithTool(prompt: string) {
    await connection();
    // Everything below will be excluded from prerendering
    const result = await fetch("/api/cortex/agent", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers: { 
            "Content-Type": "application/json" 
        },
      }
    );

    const data = await result.json();

    if (!data) {
        return {
            data: "",
            status: HttpStatusCode.InternalServerError,
            success: false
        };
    }
    
    return {
        data: JSON.stringify(data),
        status: HttpStatusCode.Accepted,
        success: true
    };
}
