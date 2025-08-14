import { NextRequest, NextResponse } from "next/server";
import { CortexChat } from "@/lib/CortexChat";
import snowflake from "snowflake-sdk";

export const dynamic = "force-dynamic";

type ParsedResponse = {
  sql: string;
  text: string;
  citations: string;
  table?: any[];
};

/** Environment variables */
const ACCOUNT = process.env.ACCOUNT!;
const DATABASE = process.env.DATABASE!;
const SEMANTIC_VIEW_SCHEMA = process.env.SEMANTIC_VIEW_SCHEMA!;
const USER = process.env.USER!;
const PASSWORD = process.env.USER_PASSWORD!
const WAREHOUSE = process.env.WAREHOUSE!;
const ROLE = process.env.USER_ROLE!;
const HOST = process.env.HOST!;
const RSA_PRIVATE_KEY_PATH = process.env.RSA_PRIVATE_KEY_PATH!;
const RSA_PRIVATE_KEY_PASSPHRASE = process.env.RSA_PRIVATE_KEY_PASSPHRASE!;
const AGENT_ENDPOINT = process.env.AGENT_ENDPOINT!;
const SEARCH_SERVICE = process.env.SEARCH_SERVICE!;
const SEMANTIC_MODEL = process.env.SEMANTIC_MODEL_SEMANTIC_VIEW!;
const MODEL = process.env.MODEL!;

/** Initialize CortexChat once */
const CORTEX_APP = new CortexChat({
  agentUrl: AGENT_ENDPOINT,
  searchService: SEARCH_SERVICE,
  semanticModel: SEMANTIC_MODEL,
  model: MODEL,
  account: ACCOUNT,
  user: USER,
  privateKeyPath: RSA_PRIVATE_KEY_PATH,
  privateKeyPassphrase: RSA_PRIVATE_KEY_PASSPHRASE,
});

/** Initialize Snowflake connection */
const CONN = snowflake.createConnection({
  account: ACCOUNT,
  database: DATABASE,
  schema: SEMANTIC_VIEW_SCHEMA,
  warehouse: WAREHOUSE,
  role: ROLE,
  username: USER,
  password: PASSWORD,
  host: HOST,
  authenticator: "SNOWFLAKE_JWT",
  privateKeyPath: RSA_PRIVATE_KEY_PATH,
  privateKeyPass: RSA_PRIVATE_KEY_PASSPHRASE,
  streamResult:false
});

CONN.connect((err, _) => {
  if (err) console.error("❄️ connection error:", err);
  else console.log("❄️ Connected");
});

/**
 * Parses a raw streaming response into SQL, plain text, and citations.
 *
 * @param {string} raw - The raw string response from the streaming API.
 * @returns {ParsedResponse} An object containing extracted SQL, combined text, and citations.
 */
function parseRaw(raw: string): ParsedResponse {
  let sql = "";
  let text = "";
  let citations = "";

  try {
    raw
      .split("\n")
      .filter(line => line.startsWith("data: "))
      .map(line => line.replace("data: ", ""))
      .filter(jsonStr => jsonStr !== "[DONE]")
      .map((jsonStr) => JSON.parse(jsonStr))
      .forEach(data => {
        if (!data?.delta?.content) return;
        data.delta.content.forEach((c: any) => {
            if (c.type === "tool_results" && c.tool_results?.content) {
              ({ sql, citations } = extractToolResults(c.tool_results.content, sql, citations));
            }
            if (c.type === "text") {
              text += c.text ?? "";
            }
        })
      });
  } catch (e) {
    console.error("Error parsing raw:", e);
  }

  return { sql, text, citations };
}

/**
 * Extracts SQL and citations from tool result content.
 *
 * @param {any[]} toolContent - Array of tool result objects.
 * @param {string} currentSql - Current SQL value.
 * @param {string} currentCitations - Current citations string.
 * @returns {{ sql: string; citations: string }} Updated SQL and citations.
 */
function extractToolResults(
  toolContent: any[],
  currentSql: string,
  currentCitations: string
): { sql: string; citations: string } {
  let sql = currentSql;
  let citations = currentCitations;

  toolContent.forEach(tr => {
    if (tr.json?.sql) sql = tr.json.sql;
    if (tr.json?.searchResults) {
      citations += tr.json.searchResults.map((r: any) => r.text).join("\n");
    }
  });

  return { sql, citations };
}

/**
 * Execute SQL on Snowflake
 * @param {string} sql
 * @returns {Promise<any[]>}
 */
async function executeSql(sql: string): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    if (!sql) return resolve([]);
    CONN.execute({
      sqlText: sql,
      complete: (err, stmt, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      },
    });
  });
}

/**
 * Cortex agent POST route
 * @param {NextRequest} req
 * @returns {Promise<NextResponse>}
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    if (!body?.prompt || typeof body.prompt !== "string") {
      return NextResponse.json({ error: "Invalid request. 'prompt' is required." }, { status: 400 });
    }

    const agentResp = await CORTEX_APP.chat(body.prompt);
    const parsed = parseRaw(agentResp.raw);
    const table = await executeSql(parsed.sql);

    return NextResponse.json({ ...parsed, table: JSON.stringify(table) }, { status: 200 });
  } catch (e: any) {
    console.error("Cortex route error:", e);
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 });
  }
}
