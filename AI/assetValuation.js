// assetValuation.js

async function getAssetValuation(args) {
    console.log("Starting getAssetValuation function");
    console.log("Input args:", args);
    
    const apiUrl = "https://cl-ai.onrender.com/value";
    console.log("API URL:", apiUrl);

    const body = {
    name: args[0],
    type: args[1],
    origin: args[2],
    shareable: true,
    variant: args[3]
    };
    
    console.log("Request body:", JSON.stringify(body, null, 2));

    const requestOptions = {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
    };
    
    console.log("Making HTTP request...");

    try {
        const response = await fetch(apiUrl, requestOptions);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        
        console.log("Function completed successfully");
        return data;
        
    } catch (error) {
        console.error("Error making request:", error);
        throw error;
    }
}

// Example usage with sample arguments
const sampleArgs =  ["Partyhat", "virtual", "RuneScape", "Red"];
getAssetValuation(sampleArgs).then(result => {
    console.log("Final result:", result);
}).catch(error => {
    console.error("Function failed:", error);
});