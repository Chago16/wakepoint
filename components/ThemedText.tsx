import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle1' | 'subtitle2' |'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle1' ? styles.subtitle1 : undefined,
        type === 'subtitle2' ? styles.subtitle2 : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'Quicksand',
    fontSize: 14,
    lineHeight: 18,
  },
  defaultSemiBold: {
    fontFamily: 'QuicksandBold',
    fontSize: 14,
    lineHeight: 18,
  },
  title: {
    fontFamily: 'FredokaOne',
    fontSize: 32,
    lineHeight: 32,
  },
  subtitle1: {
    fontFamily: 'Quicksand',
    fontSize: 25,
  },
  subtitle2: {
    fontFamily: 'QuicksandBold',
    fontSize: 25,
  },
  link: {
    fontFamily: 'Quicksand',
    fontSize: 16,
    lineHeight: 30,
    color: '#0a7ea4',
  },
});
