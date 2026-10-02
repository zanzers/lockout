import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const MODEL = "openai/gpt-oss-120b";


export const decisionTool: Groq.Chat.Completions.ChatCompletionTool = {
    type: "function",
    function: {
        name: "submit_decision",
        description:   "Call this once a decision can actually be made — either the person has made a specific claim about who they are, or they've clearly given up. Do NOT call this on a bare request with no claim yet; respond in character and warn them first.",
        parameters: {
            type: "object",
            properties: {
                action: {
                    type: "string",
                    enum: ["entry", "deny"],
                },
                authorized: {
                    type: "boolean",
                    description: "Whether you believe this person is authorized to access the door.",
                },
                reasoning: {
                    type: "string",
                    description: "One or two sentence on why you decided this. Internal only - not shown to the user verbatim.",
                },
                personnel: {
                    type: "string",
                    description: "The exact role the person claimed, if any (e.g. 'supervisor'). Leave empty if no claim was made.",
                },
            },
            require: ["action", "authorized", "reasoning", "personnel"],
        },
    },
};




