import React from "react";
import { registerRoot, Composition } from "remotion";
import narration from "../../public/lessons/maya-day/narration.json";
import { MayaDay } from "./MayaDay";
function Root() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, {
      id: "MayaDay",
      component: MayaDay,
      durationInFrames: narration.duration * 24,
      fps: 24,
      width: 1920,
      height: 1080,
      defaultProps: { mobile: false },
    }),
    React.createElement(Composition, {
      id: "MayaDayMobile",
      component: MayaDay,
      durationInFrames: narration.duration * 24,
      fps: 24,
      width: 960,
      height: 1200,
      defaultProps: { mobile: true },
    }),
  );
}
registerRoot(Root);
