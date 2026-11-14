import React from "react";
import { registerRoot, Composition } from "remotion";
import narration from "../../public/lessons/maya-day/narration.json";
import { MayaDay } from "./MayaDay";
import { WhatIsAI } from "./WhatIsAI";
import foundations from "../../public/lessons/what-is-ai/narration.json";
import { BeforeChatGPT } from "./BeforeChatGPT";
import history from "../../public/lessons/before-chatgpt/narration.json";
import { AiOrSoftware } from "./AiOrSoftware";
import software from "../../public/lessons/ai-or-software/narration.json";
import { WhatAiCanDo } from "./WhatAiCanDo";
import charge from "../../public/lessons/what-ai-can-do/narration.json";
import { ANewHelper } from "./ANewHelper";
import helper from "../../public/lessons/a-new-helper/narration.json";
import { TheEmailThatSaidNothing } from "./TheEmailThatSaidNothing";
import email from "../../public/lessons/the-email-that-said-nothing/narration.json";
import { ThreeTriesAtTheFlyer } from "./ThreeTriesAtTheFlyer";
import flyer from "../../public/lessons/three-tries-at-the-flyer/narration.json";
import { ThirtyPagesByFriday } from "./ThirtyPagesByFriday";
import pages from "../../public/lessons/thirty-pages-by-friday/narration.json";
import { TheGrantThatDidntExist } from "./TheGrantThatDidntExist";
import grant from "../../public/lessons/the-grant-that-didnt-exist/narration.json";
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
    ...(
      [
        ["AiOrSoftware", AiOrSoftware, software.duration],
        ["WhatAiCanDo", WhatAiCanDo, charge.duration],
        ["ANewHelper", ANewHelper, helper.duration],
        ["TheEmailThatSaidNothing", TheEmailThatSaidNothing, email.duration],
        ["ThreeTriesAtTheFlyer", ThreeTriesAtTheFlyer, flyer.duration],
        ["ThirtyPagesByFriday", ThirtyPagesByFriday, pages.duration],
        ["TheGrantThatDidntExist", TheGrantThatDidntExist, grant.duration],
      ] as const
    ).flatMap(([id, component, duration]) =>
      [false, true].map((mobile) =>
        React.createElement(Composition, {
          key: `${id}${mobile ? "Mobile" : ""}`,
          id: `${id}${mobile ? "Mobile" : ""}`,
          component,
          durationInFrames: duration * 24,
          fps: 24,
          width: mobile ? 960 : 1920,
          height: mobile ? 1200 : 1080,
          defaultProps: { mobile },
        }),
      ),
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
