import { styled, YStack, XStack, Text, Image } from 'tamagui'

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$background',
  borderRadius: '$4',
  padding: '$4',
  elevation: '$2',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  variants: {
    variant: {
      elevated: {
        elevation: '$4',
      },
      outlined: {
        borderWidth: 1,
        borderColor: '$borderColor',
      },
      flat: {
        elevation: 0,
        shadowOpacity: 0,
      },
    },
  } as const,
  defaultVariants: {
    variant: 'elevated',
  },
})

export interface FoodCardProps {
  title: string
  description: string
  price: number
  imageUrl: string
  chef: string
  cuisine: string
  isVegetarian: boolean
}

export function FoodCard({
  title,
  description,
  price,
  imageUrl,
  chef,
  cuisine,
  isVegetarian,
}: FoodCardProps) {
  return (
    <Card>
      <Image
        source={{ uri: imageUrl }}
        alt={title}
        width="100%"
        height={200}
        borderRadius="$2"
      />
      <YStack space="$2" marginTop="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$6" fontWeight="600">
            {title}
          </Text>
          <Text fontSize="$5" fontWeight="600" color="$primary">
            ₹{price}
          </Text>
        </XStack>
        <Text fontSize="$4" color="$gray11">
          {description}
        </Text>
        <XStack space="$2" alignItems="center">
          <Text fontSize="$3" color="$gray10">
            By {chef}
          </Text>
          <Text fontSize="$3" color="$gray10">
            • {cuisine}
          </Text>
          <Text
            fontSize="$3"
            color={isVegetarian ? '$green10' : '$red10'}
            fontWeight="500"
          >
            • {isVegetarian ? 'Veg' : 'Non-veg'}
          </Text>
        </XStack>
      </YStack>
    </Card>
  )
} 