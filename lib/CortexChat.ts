import axios from "axios";

import { generateJwt } from "@/lib/jwtGenerator";

export interface CortexChatOptions {
  agentUrl: string;
  searchService: string;
  semanticModel: string;
  model: string;
  account: string;
  user: string;
  privateKeyPath: string; // .p8 file
  privateKeyPassphrase: string;
}

export interface CortexChatResponse {
  text: string;
  sql: string;
  citations: string;
  raw?: any;
}

/**
 * Service for interacting with Snowflake Cortex Chat API.
 */
export class CortexChat {
  private readonly agentUrl: string;
  private readonly searchService: string;
  private readonly semanticModel: string;
  private readonly model: string;
  private readonly account: string;
  private readonly user: string;
  private readonly privateKeyPath: string;
  private readonly privateKeyPassphrase: string;
  private jwtToken: string | null = null;

  /**
   * Creates a new CortexChat instance.
   * @param {CortexChatOptions} options - Configuration options for CortexChat.
   */
  constructor(options: CortexChatOptions) {
    this.agentUrl = options.agentUrl;
    this.searchService = options.searchService;
    this.semanticModel = options.semanticModel;
    this.model = options.model;
    this.account = options.account.toUpperCase();
    this.user = options.user.toUpperCase();
    this.privateKeyPath = options.privateKeyPath;
    this.privateKeyPassphrase = options.privateKeyPassphrase;
  }

  /**
   * Sends a POST request to the Cortex API.
   * @private
   * @param {any} payload - Request payload to send to the Cortex agent.
   * @returns {Promise<any>} Axios response.
   */
  private async makeRestAPICall(payload: any): Promise<any> {
    if (!this.jwtToken || this.jwtToken == 'null' || this.jwtToken == 'undefined'){
      this.jwtToken = await generateJwt(
        this.privateKeyPath, 
        this.privateKeyPassphrase, 
        this.account, 
        this.user
      );
    }
    const headers = {
      Authorization: `Bearer ${this.jwtToken}`,
      "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    return axios.post(this.agentUrl, payload, { headers });
  }

  /**
   * Sends a user prompt to Cortex Chat and returns the parsed response.
   * @param {string} prompt - User's input query or message.
   * @returns {Promise<CortexChatResponse>} Parsed Cortex Chat response.
   */
  public async chat(prompt: string): Promise<CortexChatResponse> {
    const payload = {
      model: this.model,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
      tools: [
        { tool_spec: { type: "cortex_search", name: "vehicles_info_search" } },
        { tool_spec: { type: "cortex_analyst_text_to_sql", name: "supply_chain" } },
      ],
      tool_resources: {
        vehicles_info_search: { name: this.searchService, max_results: 1, title_column: "title", id_column: "relative_path" },
        supply_chain: { semantic_model_file: this.semanticModel },
      },
      tool_choice: { type: "auto" },
    };

    const resp = await this.makeRestAPICall(payload);
    const data = resp.data;

    let text = "", sql = "", citations = "";
    if (data?.messages) {
      for (const msg of data.messages) {
        if (msg.delta?.content) {
          for (const c of msg.delta.content) {
            if (c.type === "text") text += c.text || "";
            if (c.type === "tool_results") {
              for (const tr of c.tool_results.content || []) {
                if (tr.json?.sql) sql = tr.json.sql;
                if (tr.json?.searchResults) citations += tr.json.searchResults.map((r: any) => r.text || "").join("\n");
              }
            }
          }
        }
      }
    }

    return { text, sql, citations, raw: data };
  }
}
