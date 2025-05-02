
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

export const sendMessage = async (message: string, file?: File): Promise<string> => {
  try {
    console.log("Sending message to API:", message);
    if (file) {
      console.log("With file:", file.name, file.type, file.size);
    }
    
    // Add a timeout to the fetch request - increased to 2 minutes (120000ms)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
    // API URL
    const apiUrl = "https://api.langflow.astra.datastax.com/lf/3ab69190-2535-4261-ad71-ea0de9b902bc/api/v1/run/b3c8627a-e65a-434c-a2b2-12f9cd0fdd20?stream=false";
    
    // Use the same proxy URL approach for both types of requests
    const corsProxyUrl = `https://cors-8x10.onrender.com/${apiUrl}`;
    console.log("Using CORS proxy URL:", corsProxyUrl);
    
    // Prepare headers - same for both request types
    const headers: HeadersInit = {
      "Authorization": "Bearer AstraCS:RLRKtILLivAftxIYOjgHCgEv:87fa246f37d3883e01b309f5d561568c8bc1993a3b43801b2d7ecb24678adfff",
      "Accept": "application/json",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
      "X-Requested-With": "XMLHttpRequest"
    };
    
    let body;
    
    if (file) {
      // For file uploads, use fetch's Blob processing
      // Convert the file to base64 to avoid binary encoding issues
      const base64File = await fileToBase64(file);
      
      // Include the base64 file in the JSON payload
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({
        input_value: message || "",
        output_type: "chat",
        input_type: "chat",
        file_data: {
          name: file.name,
          type: file.type,
          data: base64File
        }
      });
    } else {
      // For text-only messages, set Content-Type header
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({
        input_value: message,
        output_type: "chat",
        input_type: "chat",
      });
    }
    
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

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Extract the base64 data from the result
      // Format is "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      const base64String = reader.result as string;
      // Extract only the base64 part (after the comma)
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};
