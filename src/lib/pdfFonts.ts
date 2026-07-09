import path from "path";
import { Font } from "@react-pdf/renderer";

// react-pdf's built-in fonts (Helvetica/Times/Courier) only cover the
// standard PDF Latin encoding — no Cyrillic glyphs. PT Sans (Paratype, free
// license) ships full Latin+Cyrillic coverage in a single .ttf per weight via
// @expo-google-fonts/pt-sans, unlike most other font packages which split
// glyphs into per-script subset files.
const FONT_FAMILY = "PTSans";

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  const base = path.join(process.cwd(), "node_modules", "@expo-google-fonts", "pt-sans");
  Font.register({
    family: FONT_FAMILY,
    fonts: [
      { src: path.join(base, "400Regular", "PTSans_400Regular.ttf"), fontWeight: "normal" },
      { src: path.join(base, "700Bold", "PTSans_700Bold.ttf"), fontWeight: "bold" },
    ],
  });
}

export { FONT_FAMILY };
