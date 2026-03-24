import { ScreenRenderer } from "@/components/mockup/screen-renderer";
import { getScreenByPath } from "@/lib/mockup-data";

export default function HomePage() {
  const screen = getScreenByPath("/");

  if (!screen) {
    return null;
  }

  return <ScreenRenderer screen={screen} />;
}
