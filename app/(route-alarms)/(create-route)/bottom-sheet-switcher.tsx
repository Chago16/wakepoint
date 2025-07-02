import React from 'react';

import AlarmSetSheet from './bottom-sheets/alarm-set-sheet';
import { CreateTripSheet } from './bottom-sheets/create-trip-sheet';
import TripCheckpointsSheet from './bottom-sheets/trip-checkpoints-sheet';

type Mode = 'create' | 'checkpoints' | 'alarm';

interface Props {
  mode: Mode;
  setMode: (mode: Mode) => void;

  // Location
  setFromCoords: (coords: [number, number]) => void;
  setToCoords: (coords: [number, number]) => void;
  fromCoords: [number, number] | null;
  toCoords: [number, number] | null;
  fromPlaceName: string;
  setFromPlaceName: (name: string) => void;
  toPlaceName: string;
  setToPlaceName: (name: string) => void;

  activePoint: 'from' | 'to' | null;
  setActivePoint: (point: 'from' | 'to' | null) => void;

  // Alarm settings
  alarmSoundIndex: number;
  setAlarmSoundIndex: (index: number) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (value: boolean) => void;
  notifyEarlierIndex: number;
  setNotifyEarlierIndex: (index: number) => void;

  // Checkpoints
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

  fromCoords,
  toCoords,
  setFromCoords,
  setToCoords,
  fromPlaceName,
  toPlaceName,
  setFromPlaceName,
  setToPlaceName,
  activePoint,
  setActivePoint,

  alarmSoundIndex,
  setAlarmSoundIndex,
  vibrationEnabled,
  setVibrationEnabled,
  notifyEarlierIndex,
  setNotifyEarlierIndex,

  checkpoints,
  setCheckpoints,
  activeCheckpointId,
  setActiveCheckpointId,
}) => {
  switch (mode) {
    case 'create':
      return (
        <CreateTripSheet
          setMode={setMode}

          activePoint={activePoint}
          setActivePoint={setActivePoint}

          fromPlaceName={fromPlaceName}
          setFromPlaceName={setFromPlaceName}
          fromCoords={fromCoords}
          setFromCoords={setFromCoords}

          toPlaceName={toPlaceName}
          setToPlaceName={setToPlaceName}
          toCoords={toCoords}
          setToCoords={setToCoords}

          alarmSoundIndex={alarmSoundIndex}
          setAlarmSoundIndex={setAlarmSoundIndex} // ✅ THIS MUST EXIST
          vibrationEnabled={vibrationEnabled}
          setVibrationEnabled={setVibrationEnabled}
          notifyEarlierIndex={notifyEarlierIndex}
          setNotifyEarlierIndex={setNotifyEarlierIndex} // ✅ THIS TOO
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
       return (
        <AlarmSetSheet
          alarmSoundIndex={alarmSoundIndex}
          vibrationEnabled={vibrationEnabled}
          notifyEarlierIndex={notifyEarlierIndex}
          fromPlaceName={fromPlaceName}
          toPlaceName={toPlaceName}
          fromCoords={fromCoords}
          toCoords={toCoords}
          checkpoints={checkpoints}
        />
      );

    default:
      return null;
  }
};

export default BottomSheetSwitcher;
