import { BASE_URL } from '@/config'; // Make sure this points to your API base URL

const TRIP_HISTORY_URL = `${BASE_URL}/api/trip-history`;

export async function saveTripHistory(tripData: {
  user_id: string;
  history_id: string;
  from: { lat: number; lng: number };
  from_name?: string;
  destination: { lat: number; lng: number };
  destination_name?: string;
  checkpoints: { lat: number; lng: number }[];
  date_start: Date;
  duration: number;
}) {
  const res = await fetch(TRIP_HISTORY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save trip');
  return data;
}


export async function getTripHistories(user_id: string) {
  const res = await fetch(`${TRIP_HISTORY_URL}/${user_id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch trips');
  return data;
}
