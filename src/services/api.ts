
interface LangflowResponse {
  outputs: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
        };
      };
    }>;
  }>;
}

export const sendMessage = async (message: string): Promise<string> => {
  try {
    const response = await fetch(
      "https://api.langflow.astra.datastax.com/lf/e637d789-67d3-4dd8-a7d5-44246994d0a7/api/v1/run/4957ff93-d8f4-4939-a15c-b5a9dd27a60d?stream=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <YOUR_APPLICATION_TOKEN>",
        },
        body: JSON.stringify({
          input_value: message,
          output_type: "chat",
          input_type: "chat",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data: LangflowResponse = await response.json();
    return data.outputs[0].outputs[0].results.message.text;
  } catch (error) {
    console.error("Error sending message:", error);
    return "Sorry, I couldn't process your message at this time.";
  }
};
