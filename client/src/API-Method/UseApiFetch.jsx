// import { useState } from 'react';

// const UseApiFetch = () => {
//     const [responseData, setResponseData] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [fetchError, setFetchError] = useState(null);
//     const [apiKey, setApiKey] = useState(null);

//     const baseUrl = import.meta.env.VITE_API_URL
//     console.log('Base URL:', baseUrl);

//     function serverRequest(serverRequestParam) {
//         if (!baseUrl) {
//             const errorMsg = 'VITE_API_URL is not defined in .env file';
//             setFetchError(errorMsg);
//             setIsLoading(false);
//             console.error(errorMsg);
//             return;
//         }

//         const fetchUrl = baseUrl.replace(/\/$/, '') + serverRequestParam.apiUrl; // Remove trailing slash from baseUrl
//         const apiKeyParam = serverRequestParam.apiKey;
//         console.log('Fetching URL:', fetchUrl);

//         const requestOptions = {
//             method: serverRequestParam.method || 'POST', // Default to POST as per loginData
//             headers: serverRequestParam.headers || { 'Content-Type': 'application/json' },
//         };

//         if (serverRequestParam.method !== 'GET' && serverRequestParam.body) {
//             requestOptions.body = JSON.stringify(serverRequestParam.body);
//         }
        
//         setIsLoading(true);
//         setApiKey(apiKeyParam);
//         setFetchError(null);

//         fetch(fetchUrl, requestOptions)
//             .then(async (response) => {
//                 // Check if response is JSON
//                 const contentType = response.headers.get('content-type');
//                 if (!contentType || !contentType.includes('application/json')) {
//                     const text = await response.text();
//                     console.error('Non-JSON response:', text.substring(0, 100));
//                     throw new Error(`Non-JSON response received: ${text.substring(0, 100)}`);
//                 }

//                 const data = await response.json();
//                 if (!response.ok) {
//                     throw new Error(data.message || `API error: ${response.status}`);
//                 }
//                 setResponseData(data);
//                 setIsLoading(false);
//             })
//             .catch((error) => {
//                 setFetchError(error.message);
//                 setIsLoading(false);
//                 console.error('Fetch error:', error.message);
//             });
//     }

//     return {
//         responseData,
//         isLoading,
//         apiKey,
//         fetchError,
//         serverRequest,
//     };
// };

// export default UseApiFetch;




import { useState } from 'react';

const UseApiFetch = () => {
    const [responseData, setResponseData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [apiKey, setApiKey] = useState(null);

    const baseUrl = import.meta.env.VITE_API_URL 
    console.log('Base URL:', baseUrl);

    function serverRequest(serverRequestParam) {
        if (!baseUrl) {
            const errorMsg = 'VITE_API_URL is not defined and no fallback provided';
            setFetchError(errorMsg);
            setIsLoading(false);
            console.error(errorMsg);
            return;
        }

        const fetchUrl = baseUrl.replace(/\/$/, '') + serverRequestParam.apiUrl;
        const apiKeyParam = serverRequestParam.apiKey;
        console.log('Fetching URL:', fetchUrl);

        const requestOptions = {
            method: serverRequestParam.method || 'GET',
            headers: serverRequestParam.headers || { 'Content-Type': 'application/json' },
        };

        if (serverRequestParam.method !== 'GET' && serverRequestParam.body) {
            requestOptions.body = JSON.stringify(serverRequestParam.body);
        }
        
        setIsLoading(true);
        setApiKey(apiKeyParam);
        setFetchError(null);

        fetch(fetchUrl, requestOptions)
            .then(async (response) => {
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error(`Non-JSON response (Status: ${response.status}):`, text.substring(0, 100));
                    throw new Error(`Non-JSON response received (Status: ${response.status}): ${text.substring(0, 100)}`);
                }

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `API error: ${response.status}`);
                }
                setResponseData(data);
                setIsLoading(false);
            })
            .catch((error) => {
                setFetchError(error.message);
                setIsLoading(false);
                console.error('Fetch error:', error.message);
            });
    }

    return {
        responseData,
        isLoading,
        apiKey,
        fetchError,
        serverRequest,
    };
};

export default UseApiFetch;