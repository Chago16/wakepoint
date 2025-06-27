import React from 'react';

import AlarmSetSheet from './edit-bottom-sheets/edit-alarm-set-sheet';
import TripCheckpointsSheet from './edit-bottom-sheets/edit-trip-checkpoints-sheet';
import CreateTripSheet from './edit-bottom-sheets/edit-trip-sheet';

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
