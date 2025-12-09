import axios from 'axios';

export interface LocationData {
  country: string;
  region: string;
  city: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
}

/**
 * Get location data from IP address using IP-API.com (free tier)
 * Falls back to Cloudflare if IP-API fails
 */
export async function getLocationFromIP(ip: string): Promise<LocationData | null> {
  // Skip localhost/private IPs
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return null;
  }

  // Try IP-API.com first (free, no API key needed, 45 requests/minute)
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000,
      params: {
        fields: 'status,country,regionName,city,lat,lon,timezone,isp',
      },
    });

    if (response.data.status === 'success') {
      return {
        country: response.data.country || 'Unknown',
        region: response.data.regionName || 'Unknown',
        city: response.data.city || 'Unknown',
        lat: response.data.lat,
        lon: response.data.lon,
        timezone: response.data.timezone,
        isp: response.data.isp,
      };
    }
  } catch (error) {
    console.warn(`IP-API failed for ${ip}:`, error);
  }

  // Fallback to Cloudflare (via their API)
  try {
    const response = await axios.get(`https://cloudflare.com/cdn-cgi/trace`, {
      timeout: 5000,
    });
    
    // Cloudflare trace doesn't give location, but we can try their IP geolocation
    // For now, return null and let the component handle it
  } catch (error) {
    console.warn(`Cloudflare geolocation failed:`, error);
  }

  return null;
}

/**
 * Extract IP address from node address/endpoint
 */
export function extractIPFromAddress(address: string): string | null {
  // Try to extract IP from various address formats
  // Format: "ip:port" or "hostname:port" or "hostname"
  
  // Remove protocol if present
  let cleanAddress = address.replace(/^https?:\/\//, '');
  
  // Remove port if present
  cleanAddress = cleanAddress.split(':')[0];
  
  // Check if it's an IP address (IPv4)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(cleanAddress)) {
    return cleanAddress;
  }
  
  // For hostnames, we'd need DNS resolution (not done here for simplicity)
  // In production, you might want to resolve hostnames to IPs
  return null;
}

/**
 * Format location string from LocationData
 */
export function formatLocation(location: LocationData | null): string {
  if (!location) return 'Unknown';
  
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

