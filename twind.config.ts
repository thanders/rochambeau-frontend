import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  preflight: (css) => ({
    ...css,
    "@keyframes rainbowBackgroundKeyframes": {
      "0%": { backgroundPosition: "0% 50%" },
      "100%": { backgroundPosition: "100% 50%" },
    },
    '.rainbow-highlight': {
      background: 'linear-gradient(to right, #ff008022, #ff3d4d22, #ff684422, #ff8c0022, #f1c40f22, #2ecc7122, #3498db22, #8e44ad22, #ff008022, #ff008022)',
      backgroundSize: '2000% 100%',
      animation: 'rainbowBackgroundKeyframes 7s linear infinite',
    },
  }),
} satisfies Options;
