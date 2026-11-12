import React from "react";
import { registerRoot, Composition } from "remotion";
import narration from "../../public/lessons/maya-day/narration.json";
import { MayaDay } from "./MayaDay";
import { WhatIsAI } from "./WhatIsAI";
import foundations from "../../public/lessons/what-is-ai/narration.json";
import { BeforeChatGPT } from "./BeforeChatGPT";
import history from "../../public/lessons/before-chatgpt/narration.json";
function Root() {
  return React.createElement(
    React.Fragment,
    null,
    ...[false, true].map((mobile) =>
      React.createElement(Composition, {
        key: mobile ? "WhatIsAIMobile" : "WhatIsAI",
        id: mobile ? "WhatIsAIMobile" : "WhatIsAI",
        component: WhatIsAI,
        durationInFrames: foundations.duration * 24,
        fps: 24,
        width: mobile ? 960 : 1920,
        height: mobile ? 1200 : 1080,
        defaultProps: { mobile },
      }),
    ),
    ...[false, true].map((mobile) =>
      React.createElement(Composition, {
        key: mobile ? "BeforeChatGPTMobile" : "BeforeChatGPT",
        id: mobile ? "BeforeChatGPTMobile" : "BeforeChatGPT",
        component: BeforeChatGPT,
        durationInFrames: history.duration * 24,
        fps: 24,
        width: mobile ? 960 : 1920,
        height: mobile ? 1200 : 1080,
        defaultProps: { mobile },
      }),
    ),
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
