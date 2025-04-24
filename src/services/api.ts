
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
    
    // Try with a CORS proxy to bypass CORS restrictions
    const apiUrl = "https://api.langflow.astra.datastax.com/lf/e637d789-67d3-4dd8-a7d5-44246994d0a7/api/v1/run/4957ff93-d8f4-4939-a15c-b5a9dd27a60d?stream=false";
    
    // const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    const corsProxyUrl = `https://cors-anywhere.herokuapp.com/?${encodeURIComponent(apiUrl)}`;
    console.log("Using CORS proxy URL:", corsProxyUrl);
    
    const response = await fetch(corsProxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "AstraCS:pIZpceOJlRLoFPnzQEZZDUBW:b6025723ae7f2a2f5971b7d2159a72444004ed140d10a475dff464d25e0dd47b",
        "Accept": "application/json",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*", // Request CORS headers
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify({
        input_value: message,
        output_type: "chat",
        input_type: "chat",
      }),
      signal: controller.signal,
      mode: "cors", // Explicitly set CORS mode
      credentials: 'omit' // Omit credentials for CORS requests
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
