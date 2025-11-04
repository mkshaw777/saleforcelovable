import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * Haversine formula to calculate distance between two GPS coordinates
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { attendance_id } = await req.json();

    if (!attendance_id) {
      return new Response(
        JSON.stringify({ error: 'attendance_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all GPS logs for this attendance record
    const { data: gpsLogs, error: fetchError } = await supabase
      .from('gps_logs')
      .select('coordinates, timestamp')
      .eq('attendance_id', attendance_id)
      .order('timestamp', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    if (!gpsLogs || gpsLogs.length < 2) {
      // Need at least 2 points to calculate distance
      return new Response(
        JSON.stringify({
          verified_km: 0,
          message: 'Insufficient GPS data points',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate total distance traveled
    let totalDistance = 0;
    
    for (let i = 1; i < gpsLogs.length; i++) {
      const prev = gpsLogs[i - 1].coordinates;
      const curr = gpsLogs[i].coordinates;
      
      const distance = calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
      
      // Only add reasonable distances (filter out GPS errors)
      // Max speed check: 150 km/h = 0.0417 km/s
      const timeDiff = (new Date(gpsLogs[i].timestamp).getTime() - 
                        new Date(gpsLogs[i - 1].timestamp).getTime()) / 1000;
      const maxDistance = (150 / 3600) * timeDiff; // Maximum possible distance at 150 km/h
      
      if (distance <= maxDistance && distance < 10) {
        // Ignore jumps > 10km between points (likely GPS errors)
        totalDistance += distance;
      }
    }

    // Round to 2 decimal places
    const verifiedKm = Math.round(totalDistance * 100) / 100;

    // Update the attendance record with verified kilometers
    const { error: updateError } = await supabase
      .from('attendance')
      .update({ verified_km: verifiedKm })
      .eq('id', attendance_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified_km: verifiedKm,
        gps_points: gpsLogs.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error calculating verified km:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});