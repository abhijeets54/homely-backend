"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  Button: () => Button,
  Card: () => Card,
  FoodCard: () => FoodCard,
  TamaguiProvider: () => TamaguiProvider,
  default: () => config
});
module.exports = __toCommonJS(index_exports);

// src/components/Button.tsx
var import_tamagui = require("tamagui");
var Button = (0, import_tamagui.styled)(import_tamagui.Button, {
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
var import_tamagui2 = require("tamagui");
var import_jsx_runtime = require("react/jsx-runtime");
var Card = (0, import_tamagui2.styled)(import_tamagui2.YStack, {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_tamagui2.Image,
      {
        source: { uri: imageUrl },
        alt: title,
        width: "100%",
        height: 200,
        borderRadius: "$2"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.YStack, { space: "$2", marginTop: "$3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.XStack, { justifyContent: "space-between", alignItems: "center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tamagui2.Text, { fontSize: "$6", fontWeight: "600", children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.Text, { fontSize: "$5", fontWeight: "600", color: "$primary", children: [
          "\u20B9",
          price
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_tamagui2.Text, { fontSize: "$4", color: "$gray11", children: description }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.XStack, { space: "$2", alignItems: "center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.Text, { fontSize: "$3", color: "$gray10", children: [
          "By ",
          chef
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_tamagui2.Text, { fontSize: "$3", color: "$gray10", children: [
          "\u2022 ",
          cuisine
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          import_tamagui2.Text,
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
var import_tamagui3 = require("tamagui");
var import_font_inter = require("@tamagui/font-inter");
var import_shorthands = require("@tamagui/shorthands");
var import_themes = require("@tamagui/themes");
var import_react_native_media_driver = require("@tamagui/react-native-media-driver");
var headingFont = (0, import_font_inter.createInterFont)({
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
var bodyFont = (0, import_font_inter.createInterFont)(
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
var config = (0, import_tamagui3.createTamagui)({
  defaultTheme: "light",
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands: import_shorthands.shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont
  },
  themes: import_themes.themes,
  tokens: import_themes.tokens,
  media: (0, import_react_native_media_driver.createMedia)({
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
var import_tamagui5 = require("tamagui");
var import_jsx_runtime2 = require("react/jsx-runtime");
var TamaguiProvider = ({ children, ...props }) => {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_tamagui5.TamaguiProvider, { config, ...props, children });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  Card,
  FoodCard,
  TamaguiProvider
});
//# sourceMappingURL=index.js.map