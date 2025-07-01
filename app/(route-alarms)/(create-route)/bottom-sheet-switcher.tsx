import React from 'react';

import AlarmSetSheet from './bottom-sheets/alarm-set-sheet';
import CreateTripSheet from './bottom-sheets/create-trip-sheet';
import TripCheckpointsSheet from './bottom-sheets/trip-checkpoints-sheet';

type Mode = 'create' | 'checkpoints' | 'alarm';

interface Props {
  mode: Mode;
  setMode: (mode: Mode) => void;
  setFromCoords: (coords: [number, number]) => void;
  setToCoords: (coords: [number, number]) => void;
  activePoint: 'from' | 'to' | null;
  setActivePoint: (point: 'from' | 'to' | null) => void;
  fromPlaceName: string;
  setFromPlaceName: (name: string) => void;
  toPlaceName: string;
  setToPlaceName: (name: string) => void;
  checkpoints: { id: string; name: string; coords: [number, number] | null; search: string }[];
  setCheckpoints: (
    cps: { id: string; name: string; coords: [number, number] | null; search: string }[]
  ) => void;
  activeCheckpointId: string | null;
  setActiveCheckpointId: (id: string | null) => void;
}

const BottomSheetSwitcher: React.FC<Props> = ({
  mode,
  setMode,
  setFromCoords,
  setToCoords,
  activePoint,
  setActivePoint,
  fromPlaceName,
  setFromPlaceName,
  toPlaceName,
  setToPlaceName,
  checkpoints,
  setCheckpoints,
  activeCheckpointId,
  setActiveCheckpointId,
}) => {
  switch (mode) {
    case 'create':
      return (
        <CreateTripSheet
          mode={mode}
          setMode={setMode}
          setFromCoords={setFromCoords}
          setToCoords={setToCoords}
          activePoint={activePoint}
          setActivePoint={setActivePoint}
          fromPlaceName={fromPlaceName}
          setFromPlaceName={setFromPlaceName}
          toPlaceName={toPlaceName}
          setToPlaceName={setToPlaceName}
        />
      );

    case 'checkpoints':
      return (
        <TripCheckpointsSheet
          setMode={setMode}
          checkpoints={checkpoints}
          setCheckpoints={setCheckpoints}
          activeCheckpointId={activeCheckpointId}
          setActiveCheckpointId={setActiveCheckpointId}
          fromLocation={fromPlaceName}
          toLocation={toPlaceName}
        />
      );

    case 'alarm':
      return <AlarmSetSheet />;
    default:
      return null;
  }
};

export default BottomSheetSwitcher;
