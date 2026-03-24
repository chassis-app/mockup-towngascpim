import { notFound } from "next/navigation";

import { ScreenRenderer } from "@/components/mockup/screen-renderer";
import { getScreenByPath } from "@/lib/mockup-data";

export default async function ScreenPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const screen = getScreenByPath(`/${slug.join("/")}`);

  if (!screen) {
    notFound();
  }

  return <ScreenRenderer screen={screen} />;
}
