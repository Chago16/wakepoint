import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle, Platform } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName =
  | 'house.fill'
  | 'paperplane.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right'
  | 'doc.text'
  | 'plus'
  | 'rectangle.portrait.and.arrow.right'
  | 'arrow.left.circle'
  | 'clock'
  | 'speaker.wave.3.fill'
  | 'location'
  | 'clock.fill'
  | 'flag'
  | 'map-marker-alt';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'doc.text': 'description',
  'plus': 'add',
  'rectangle.portrait.and.arrow.right': 'logout',
  'arrow.left.circle': 'arrow-back-ios-new',
  'clock': 'access-time',
  'speaker.wave.3.fill': 'volume-up',
  'location': 'location-on',
  'flag': 'flag',
} as unknown as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (name === 'clock.fill') {
    return <AntDesign name="clockcircle" size={size} color={color} style={style} />;
  }

  if (name === 'map-marker-alt') {
    return <FontAwesome5 name="map-marker-alt" size={size} color={color} style={style} />;
  }

  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
