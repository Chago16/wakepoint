import { useState } from 'react';

type Coords = [number, number] | null;

// Inside useTripPoints.ts
export type Checkpoint = {
  id: string;
  name: string;
  coords: [number, number] | null;
};


interface TripPointsStore {
  fromCoords: Coords;
  toCoords: Coords;
  setFromCoords: (coords: Coords) => void;
  setToCoords: (coords: Coords) => void;
  checkpoints: Checkpoint[];
  setCheckpoints: React.Dispatch<React.SetStateAction<Checkpoint[]>>;
}

export const useTripPoints = (): TripPointsStore => {
  const [fromCoords, setFromCoords] = useState<Coords>(null);
  const [toCoords, setToCoords] = useState<Coords>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  return {
    fromCoords,
    toCoords,
    setFromCoords,
    setToCoords,
    checkpoints,
    setCheckpoints,
  };
};
