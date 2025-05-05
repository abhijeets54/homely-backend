// src/components/Button.tsx
import { Button as TamaguiButton, styled } from "tamagui";
var Button = styled(TamaguiButton, {
  name: "Button",
  backgroundColor: "$background",
  borderRadius: "$4",
  paddingVertical: "$3",
  paddingHorizontal: "$5",
  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "$background"
      },
      secondary: {
        backgroundColor: "$secondary",
        color: "$background"
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "$primary",
        color: "$primary"
      }
    },
    size: {
      small: {
        paddingVertical: "$2",
        paddingHorizontal: "$3",
        fontSize: "$3"
      },
      medium: {
        paddingVertical: "$3",
        paddingHorizontal: "$5",
        fontSize: "$4"
      },
      large: {
        paddingVertical: "$4",
        paddingHorizontal: "$6",
        fontSize: "$5"
      }
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "medium"
  }
});

// src/components/Card.tsx
import { styled as styled2, YStack, XStack, Text, Image } from "tamagui";
import { jsx, jsxs } from "react/jsx-runtime";
var Card = styled2(YStack, {
  name: "Card",
  backgroundColor: "$background",
  borderRadius: "$4",
  padding: "$4",
  elevation: "$2",
  shadowColor: "$shadowColor",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  variants: {
    variant: {
      elevated: {
        elevation: "$4"
      },
      outlined: {
        borderWidth: 1,
        borderColor: "$borderColor"
      },
      flat: {
        elevation: 0,
        shadowOpacity: 0
      }
    }
  },
  defaultVariants: {
    variant: "elevated"
  }
});
function FoodCard({
  title,
  description,
  price,
  imageUrl,
  chef,
  cuisine,
  isVegetarian
}) {
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(
      Image,
      {
        source: { uri: imageUrl },
        alt: title,
        width: "100%",
        height: 200,
        borderRadius: "$2"
      }
    ),
    /* @__PURE__ */ jsxs(YStack, { space: "$2", marginTop: "$3", children: [
      /* @__PURE__ */ jsxs(XStack, { justifyContent: "space-between", alignItems: "center", children: [
        /* @__PURE__ */ jsx(Text, { fontSize: "$6", fontWeight: "600", children: title }),
        /* @__PURE__ */ jsxs(Text, { fontSize: "$5", fontWeight: "600", color: "$primary", children: [
          "\u20B9",
          price
        ] })
      ] }),
      /* @__PURE__ */ jsx(Text, { fontSize: "$4", color: "$gray11", children: description }),
      /* @__PURE__ */ jsxs(XStack, { space: "$2", alignItems: "center", children: [
        /* @__PURE__ */ jsxs(Text, { fontSize: "$3", color: "$gray10", children: [
          "By ",
          chef
        ] }),
        /* @__PURE__ */ jsxs(Text, { fontSize: "$3", color: "$gray10", children: [
          "\u2022 ",
          cuisine
        ] }),
        /* @__PURE__ */ jsxs(
          Text,
          {
            fontSize: "$3",
            color: isVegetarian ? "$green10" : "$red10",
            fontWeight: "500",
            children: [
              "\u2022 ",
              isVegetarian ? "Veg" : "Non-veg"
            ]
          }
        )
      ] })
    ] })
  ] });
}

// src/tamagui.config.ts
import { createTamagui } from "tamagui";
import { createInterFont } from "@tamagui/font-inter";
import { shorthands } from "@tamagui/shorthands";
import { themes, tokens } from "@tamagui/themes";
import { createMedia } from "@tamagui/react-native-media-driver";
var headingFont = createInterFont({
  size: {
    6: 15,
    7: 18,
    8: 20,
    9: 23,
    10: 28,
    11: 34,
    12: 41,
    13: 49,
    14: 59,
    15: 71,
    16: 85
  },
  transform: {
    6: "uppercase",
    7: "none"
  },
  weight: {
    6: "400",
    7: "700"
  },
  color: {
    6: "$colorFocus",
    7: "$color"
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6
  }
});
var bodyFont = createInterFont(
  {
    family: "Inter",
    size: {
      1: 11,
      2: 12,
      3: 13,
      4: 14,
      5: 15,
      6: 16,
      7: 18,
      8: 20,
      9: 22,
      10: 24,
      11: 26,
      12: 28,
      13: 30,
      14: 32,
      15: 36,
      16: 40
    },
    weight: {
      1: "400",
      2: "500",
      3: "600"
    }
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10))
  }
);
var config = createTamagui({
  defaultTheme: "light",
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont
  },
  themes,
  tokens,
  media: createMedia({
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" }
  })
});

// src/index.tsx
import { TamaguiProvider as TamaguiProviderOG } from "tamagui";
import { jsx as jsx2 } from "react/jsx-runtime";
var TamaguiProvider = ({ children, ...props }) => {
  return /* @__PURE__ */ jsx2(TamaguiProviderOG, { config, ...props, children });
};
export {
  Button,
  Card,
  FoodCard,
  TamaguiProvider,
  config as default
};
//# sourceMappingURL=index.mjs.map