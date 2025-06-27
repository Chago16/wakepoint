import React from 'react';

import AlarmSetSheet from './bottom-sheets/alarm-set-sheet';
import CreateTripSheet from './bottom-sheets/create-trip-sheet';
import TripCheckpointsSheet from './bottom-sheets/trip-checkpoints-sheet';

type Mode = 'create' | 'checkpoints' | 'alarm';

interface Props {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const BottomSheetSwitcher: React.FC<Props> = ({ mode, setMode }) => {
  switch (mode) {
    case 'create':
      return <CreateTripSheet setMode={setMode} />;
    case 'checkpoints':
      return <TripCheckpointsSheet setMode={setMode} />;
    case 'alarm':
      return <AlarmSetSheet />;
    default:
      return null;
  }
};

export default BottomSheetSwitcher;
