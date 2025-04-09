import { Button as TamaguiButton, styled } from 'tamagui'

export const Button = styled(TamaguiButton, {
  name: 'Button',
  backgroundColor: '$background',
  borderRadius: '$4',
  paddingVertical: '$3',
  paddingHorizontal: '$5',
  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: '$background',
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$background',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '$primary',
        color: '$primary',
      },
    },
    size: {
      small: {
        paddingVertical: '$2',
        paddingHorizontal: '$3',
        fontSize: '$3',
      },
      medium: {
        paddingVertical: '$3',
        paddingHorizontal: '$5',
        fontSize: '$4',
      },
      large: {
        paddingVertical: '$4',
        paddingHorizontal: '$6',
        fontSize: '$5',
      },
    },
  } as const,
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  },
}) 