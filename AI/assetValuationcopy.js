// assetValuation.js

async function getAssetValuation(args) {
    console.log("Starting getAssetValuation function");
    console.log("Input args:", args);
    
    const apiUrl = "https://api.rentcast.io/v1/properties/random?limit=5";
    console.log("API URL:", apiUrl);

    const requestOptions = {
        method: "GET",
        headers: {
            "accept": "application/json",
            "X-Api-Key": "45e4527bf0254b9a89cd5cbb345819a8"
        }
    };
    
    console.log("Making HTTP request...");

    try {
        const response = await fetch(apiUrl, requestOptions);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const props = await response.json();
        console.log("Response data:", props);
        
        if (!Array.isArray(props) || props.length === 0) {
            throw new Error('No property data returned');
        }
        
        const [first, name, assetType, origin, variant] = props;
        const output = {
            address: first.formattedAddress,
            lastSalePrice: first.lastSalePrice || 0
        };
        
        console.log("Processed output:", output);
        console.log("Function completed successfully");
        return output;
        
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