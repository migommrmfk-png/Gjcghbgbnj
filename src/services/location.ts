export const locationService = {
  // 1. Get user location using browser Geolocation API
  async getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  },

  // 2. Fallback IP-based location if Geolocation fails
  async getIpLocation(): Promise<{ latitude: number; longitude: number; city: string; country: string }> {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const data = await response.json();
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      city: data.city,
      country: data.country
    };
  },

  // 3. Reverse geocoding to get city name from coordinates
  async getCityName(lat: number, lng: number): Promise<string> {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'موقع غير معروف';
  }
};
