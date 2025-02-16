export async function getLocationDetails(coordinates: [number, number]): Promise<string> {
    const [lng, lat] = coordinates;
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&limit=1`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox API returned ${response.status}`);
        }
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            // Return a human‑readable location string (e.g., "Los Angeles, California, United States")
            return data.features[0].place_name;
        }
        return "Unknown location";
    } catch (error) {
        console.error("Error fetching location details:", error);
        return "Unknown location";
    }
}
