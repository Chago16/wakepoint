// hooks/useTripPoints.ts
import { create } from 'zustand';

type Coords = [number, number] | null;

export type Checkpoint = {
  id: string;
  name: string;
  coords: Coords;
  search: string;
};

interface TripPointsStore {
  fromCoords: Coords;
  toCoords: Coords;
  setFromCoords: (coords: Coords) => void;
  setToCoords: (coords: Coords) => void;
  checkpoints: Checkpoint[];
  setCheckpoints: (checkpoints: Checkpoint[]) => void;
  resetTrip: () => void;
}

// Zustand store creation
export const useTripPoints = create<TripPointsStore>((set, get) => ({
  fromCoords: null,
  toCoords: null,
  setFromCoords: (coords) => {
    console.log('🟢 setFromCoords:', coords);
    set({ fromCoords: coords });

    // Confirm change after a tick
    setTimeout(() => {
      console.log('🧠 Current fromCoords in store:', get().fromCoords);
    }, 0);
  },
  setToCoords: (coords) => {
    console.log('🔵 setToCoords:', coords);
    set({ toCoords: coords });

    // Confirm change after a tick
    setTimeout(() => {
      console.log('🧠 Current toCoords in store:', get().toCoords);
    }, 0);
  },
  checkpoints: [],
  setCheckpoints: (checkpoints) => {
    console.log('📍 Updating checkpoints:', checkpoints);
    set({ checkpoints });
  },
  resetTrip: () => {
    console.log('🧹 Resetting trip state');
    set({
      fromCoords: null,
      toCoords: null,
      checkpoints: [],
    });
  },
}));
