import Mapbox from '@rnmapbox/maps';
import { useEffect } from 'react';
import { View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

type Coords = [number, number];

type Checkpoint = {
  id: string;
  name: string;
  coords: Coords | null;
};

type TripMarkersProps = {
  fromCoords: Coords | null;
  toCoords: Coords | null;
  checkpoints: Checkpoint[];
};

const PinIcon = ({ type }: { type: 'from' | 'to' | 'checkpoint' }) => {
  const getIconName = () => {
    switch (type) {
      case 'from': return 'location';
      case 'to': return 'flag';
      case 'checkpoint': return 'checkpoint';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'from': return '#8CC63F';
      case 'to': return '#104E3B';
      case 'checkpoint': return '#2C7865';
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: 6,
        borderRadius: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      }}
    >
      <IconSymbol name={getIconName()} color={getColor()} size={20} />
    </View>
  );
};

export const TripMarkers: React.FC<TripMarkersProps> = ({ fromCoords, toCoords, checkpoints }) => {
  useEffect(() => {
    console.log('Updated TripMarkers props:', checkpoints);
  }, [checkpoints]);

  return (
    <>
      {fromCoords && (
        <Mapbox.PointAnnotation id="from" coordinate={fromCoords}>
          <PinIcon type="from" />
        </Mapbox.PointAnnotation>
      )}
      {toCoords && (
        <Mapbox.PointAnnotation id="to" coordinate={toCoords}>
          <PinIcon type="to" />
        </Mapbox.PointAnnotation>
      )}
      {checkpoints.map((cp) =>
        cp.coords ? (
          <Mapbox.PointAnnotation key={cp.id} id={`checkpoint-${cp.id}`} coordinate={cp.coords}>
            <PinIcon type="checkpoint" />
          </Mapbox.PointAnnotation>
        ) : null
      )}
    </>
  );
};
