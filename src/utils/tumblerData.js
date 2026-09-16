import tumblerBlack from "../assets/tumblerimg.png";
import tumblerOrange from "../assets/tumblerorangee.png";
import tumblerWhite from "../assets/tumblerwhite.png";

export const tumblers = [
  {
    id: 1,

    name: "Luxury Black",

    image: tumblerBlack,

    fonts: [
      "Dancing Script",
      "Bebas Neue",
      "Pacifico",
      "Bangers",
      "Passion One",
      "Courgette",
      "Yesteryear",
      "Playfair Display",
      "Poppins",
      "Lora",
      "Oswald",
    ],

    colors: ["#FFFFFF", "#FF6B00", "#FFD700", "#E5E5E5"],

    theme: {
      defaultFont: "Poppins",
      defaultColor: "#FFFFFF",
      accent: "#FF6B00",
    },

    textArea: {
      left: 120,
      top: 180,
      width: 260,
      height: 260,
    },

    logoArea: {
      left: 160,
      top: 470,
      width: 180,
      height: 120,
    },
  },

  {
    id: 2,

    name: "Burnt Orange",

    image: tumblerOrange,

    fonts: [
      "Dancing Script",
      "Bebas Neue",
      "Pacifico",
      "Bangers",
      "Passion One",
      "Courgette",
      "Yesteryear",
      "Playfair Display",
      "Poppins",
      "Lora",
      "Oswald",
    ],

    colors: ["#111111", "#FFFFFF", "#FFE8D6", "#FFD700"],

    theme: {
      defaultFont: "Montserrat",
      defaultColor: "#111111",
      accent: "#FFF4EA",
    },

    textArea: {
      left: 120,
      top: 180,
      width: 260,
      height: 260,
    },

    logoArea: {
      left: 160,
      top: 470,
      width: 180,
      height: 120,
    },
  },

  {
    id: 3,

    name: "Minimal Cream",

    image: tumblerWhite,

    fonts: [
      "Dancing Script",
      "Bebas Neue",
      "Pacifico",
      "Bangers",
      "Passion One",
      "Courgette",
      "Yesteryear",
      "Playfair Display",
      "Poppins",
      "Lora",
      "Oswald",
    ],

    colors: ["#222222", "#B67B4B", "#000000", "#444444"],

    theme: {
      defaultFont: "Playfair Display",
      defaultColor: "#222222",
      accent: "#B67B4B",
    },

    textArea: {
      left: 120,
      top: 180,
      width: 260,
      height: 260,
    },

    logoArea: {
      left: 160,
      top: 470,
      width: 180,
      height: 120,
    },
  },
];
