export interface Coordinate {
  lat: number;
  lng: number;
}

export interface SavedRoute {
  user_id: string;
  saved_route_id: string;
  from: Coordinate;
  from_name: string;
  destination: Coordinate;
  destination_name: string;
  checkpoints: Coordinate[];
  alarm_sound: string;
  vibration: boolean;
  notif_early: number;
  date_modified?: string; // optional since backend might set this
}

import { BASE_URL } from '@config';

export async function saveRoute(routeData: SavedRoute): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/saved-routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routeData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to save route');
  }

  return res.json();
}

export async function getRoutesByUserId(userId: string): Promise<SavedRoute[]> {
  const res = await fetch(`${BASE_URL}/api/saved-routes/${userId}`);

  if (!res.ok) {
    throw new Error('Failed to fetch routes');
  }

  return res.json();
}

export async function deleteRoute(saved_route_id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/saved-routes/${saved_route_id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to delete route');
  }
}

export async function getRouteById(saved_route_id: string): Promise<SavedRoute> {
  const res = await fetch(`${BASE_URL}/api/saved-routes/id/${saved_route_id}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch route by ID');
  }

  return res.json();
}



