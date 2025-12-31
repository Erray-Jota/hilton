// Global Google Maps loader - ensures script loads only once across entire app
let loadPromise: Promise<void> | null = null;
let apiKey: string | null = null;
let apiKeyPromise: Promise<string> | null = null;
let isLoaded = false;

async function fetchApiKey(): Promise<string> {
  if (apiKey) {
    return apiKey;
  }
  
  if (apiKeyPromise) {
    return apiKeyPromise;
  }
  
  apiKeyPromise = fetch('/api/config/google-maps-key')
    .then(res => res.json())
    .then(data => {
      apiKey = data.apiKey;
      apiKeyPromise = null;
      if (!apiKey) {
        throw new Error("Google Maps API key not configured");
      }
      return apiKey;
    });
  
  return apiKeyPromise;
}

export async function loadGoogleMaps(): Promise<void> {
  // If already loaded, return immediately
  if (isLoaded && (window as any).google?.maps) {
    return Promise.resolve();
  }

  // If already loading, return existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Check if script already exists in DOM
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript && (window as any).google?.maps) {
    isLoaded = true;
    return Promise.resolve();
  }

  // Create loading promise (includes API key fetch)
  loadPromise = (async () => {
    const key = await fetchApiKey();
    
    // Double-check script doesn't exist (race condition protection)
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for Google Maps to be available
      await new Promise<void>((resolve, reject) => {
        const checkGoogle = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(checkGoogle);
            isLoaded = true;
            resolve();
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkGoogle);
          reject(new Error("Timeout waiting for Google Maps"));
        }, 10000);
      });
      return;
    }

    // Create and load the script
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=Function.prototype`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        loadPromise = null;
        reject(new Error("Failed to load Google Maps"));
      };
      
      document.head.appendChild(script);
    });
  })();

  return loadPromise;
}
