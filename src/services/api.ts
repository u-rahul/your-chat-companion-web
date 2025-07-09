
import { toast } from "@/components/ui/sonner";

interface LangflowResponse {
  session_id: string;
  outputs: Array<{
    inputs: {
      input_value: string;
    };
    outputs: Array<{
      results: {
        message: {
          text: string;
          sender: string;
          sender_name: string;
          session_id: string;
          timestamp: string;
          files: any[];
          error: boolean;
        };
      };
      artifacts: {
        message: string;
        sender: string;
        sender_name: string;
        files: any[];
        type: string;
      };
      outputs: {
        message: {
          message: string;
          type: string;
        };
      };
    }>;
  }>;
}

export const sendMessage = async (message: string): Promise<string> => {
  try {
    console.log("Sending message to API:", message);
    
    // Add a timeout to the fetch request - increased to 2 minutes (120000ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    // New API URL
    const apiUrl = "https://api.langflow.astra.datastax.com/lf/e637d789-67d3-4dd8-a7d5-44246994d0a7/api/v1/run/4957ff93-d8f4-4939-a15c-b5a9dd27a60d?stream=false";
    
    // Use the same proxy URL approach for both types of requests
    const corsProxyUrl = `https://cors-8x10.onrender.com/${apiUrl}`;
    console.log("Using CORS proxy URL:", corsProxyUrl);
    
    // Prepare headers with new authorization token
    const headers: HeadersInit = {
      "Authorization": "Bearer AstraCS:yZDCyliTdXUpcTrHDzNdzbIj:ccc4a0f6ddcc9ef170f72935303a42e8a6ae2f73da6ed2fe975d21a72db8a887",
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "X-Requested-With": "XMLHttpRequest"
    };
    
    // For text-only messages
    const body = JSON.stringify({
      input_value: message,
      output_type: "chat",
      input_type: "chat",
    });
    
    const response = await fetch(corsProxyUrl, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    
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
    
    // Extract the message text from the new response structure
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
      toast.error("CORS error: Unable to access the API directly from the browser. Using proxy service.");
    } else if (error.message && error.message.includes("NetworkError")) {
      toast.error("Network error: The browser blocked the request due to CORS policy.");
    } else {
      toast.error("Failed to get a response. Please try again later.");
    }
    
    return "Sorry, I couldn't process your message at this time. There may be a CORS issue with the API connection.";
  }
};
