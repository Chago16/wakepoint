import { IconSymbol } from '@/components/ui/IconSymbol';
import Mapbox from '@rnmapbox/maps';
import React, { useEffect } from 'react';
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

const PinIcon = ({
  type,
  index,
}: {
  type: 'from' | 'to' | 'checkpoint';
  index?: number;
}) => {
  if (type === 'checkpoint') {
    return (
      <View
        style={{
          backgroundColor: '#2C7865',
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
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
          {index?.toString() ?? '?'}
        </Text>
      </View>
    );
  }

  const iconName = type === 'from' ? 'location' : 'flag';
  const iconColor = type === 'from' ? '#8CC63F' : '#104E3B';

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
      <IconSymbol name={iconName} color={iconColor} size={20} />
    </View>
  );
};

export const TripMarkers: React.FC<TripMarkersProps> = ({
  fromCoords,
  toCoords,
  checkpoints,
}) => {
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

      {checkpoints.map((cp, index) =>
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
