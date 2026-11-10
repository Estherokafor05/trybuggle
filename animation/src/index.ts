import React from "react";
import { registerRoot, Composition } from "remotion";
import { Journey } from "./Journey";
function Root() {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, {
      id: "MayaJourney",
      component: Journey,
      durationInFrames: 1710,
      fps: 30,
      width: 1920,
      height: 1080,
      defaultProps: { mobile: false },
    }),
    React.createElement(Composition, {
      id: "MayaJourneyMobile",
      component: Journey,
      durationInFrames: 1710,
      fps: 30,
      width: 960,
      height: 1200,
      defaultProps: { mobile: true },
    }),
  );
}
registerRoot(Root);
