import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'titleLarge' | 'titleSmall' | 'defaultSemiBold' | 'subtitle1' | 'subtitle2' |'link' |'option' |'button';
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
        type === 'titleLarge' ? styles.titleLarge : undefined,
        type === 'titleSmall' ? styles.titleSmall : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle1' ? styles.subtitle1 : undefined,
        type === 'subtitle2' ? styles.subtitle2 : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'option' ? styles.option : undefined,
        type === 'button' ? styles.button : undefined,
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
  titleLarge: {
    fontFamily: 'FredokaOne',
    fontSize: 48,
    lineHeight: 52,
  },
  titleSmall: {
    fontFamily: 'FredokaOne',
    fontSize: 20,
    lineHeight: 25,
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
  option: {
    fontFamily: 'QuicksandBold',
    fontSize: 10,
    lineHeight: 13,
  },
  button: {
    fontFamily: 'QuicksandBold',
    fontSize: 18,
    lineHeight: 25,
  },
});
