
import { toast } from "@/components/ui/sonner";

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
    console.log("Sending message to API:", message);
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(
      "https://api.langflow.astra.datastax.com/lf/e637d789-67d3-4dd8-a7d5-44246994d0a7/api/v1/run/4957ff93-d8f4-4939-a15c-b5a9dd27a60d?stream=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer AstraCS:kOCtkqFQqpgjFnBaWToCUkoC:f6dc29a4ea7a91b02631a941591f053d1df639eb3033c0b3ca85e267a440a8b6",
          // Add additional headers that might help with CORS
          "Accept": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({
          input_value: message,
          output_type: "chat",
          input_type: "chat",
        }),
        signal: controller.signal,
        // Ensure credentials are included
        credentials: 'omit' // Try 'omit' instead of include/same-origin
      }
    );
    
    // Clear the timeout
    clearTimeout(timeoutId);

    console.log("API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data: LangflowResponse = await response.json();
    console.log("API response data:", data);
    
    if (!data.outputs || !data.outputs[0]?.outputs || !data.outputs[0]?.outputs[0]?.results?.message?.text) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format from API");
    }
    
    return data.outputs[0].outputs[0].results.message.text;
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Give more specific error messages based on the error type
    if (error.name === 'AbortError') {
      toast.error("Request timed out. The API took too long to respond.");
    } else if (error.message && error.message.includes("Failed to fetch")) {
      toast.error("Network error. Please check your internet connection or try again later.");
    } else {
      toast.error("Failed to get a response. Please try again later.");
    }
    
    return "Sorry, I couldn't process your message at this time. There may be an issue with the API connection.";
  }
};
