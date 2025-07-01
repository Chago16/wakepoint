import Mapbox from '@rnmapbox/maps';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

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

const PinIcon = ({ type, index }: { type: 'from' | 'to' | 'checkpoint'; index?: number }) => {
  const getColor = () => {
    switch (type) {
      case 'from':
        return '#8CC63F'; // yellow green
      case 'to':
        return '#104E3B'; // dark green
      case 'checkpoint':
      default:
        return '#2C7865'; // teal
    }
  };

  const label = type === 'from' ? 'F' : type === 'to' ? 'D' : index?.toString() ?? '?';

  return (
    <View
      style={{
        backgroundColor: getColor(),
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 2,
      }}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{label}</Text>
    </View>
  );
};

export const TripMarkers: React.FC<TripMarkersProps> = ({ fromCoords, toCoords, checkpoints }) => {
  console.log('Rendering TripMarkers with checkpoints:', checkpoints);
  console.log('TripMarkers - checkpoints with coords only:', checkpoints.filter(cp => cp.coords));

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
      {checkpoints?.map((cp, index) =>
        cp.coords ? (
          <Mapbox.PointAnnotation
            key={cp.id}
            id={`checkpoint-${cp.id}`}
            coordinate={cp.coords}
          >
            <PinIcon type="checkpoint" index={index + 1} />
          </Mapbox.PointAnnotation>
        ) : null
      )}
    </>
  );
};
