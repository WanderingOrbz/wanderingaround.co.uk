// Site intro configuration — "The Line".
//
// 'full-first-then-echo' — the full ~24s journey film plays on first visit;
//                           returning visitors get the shorter echo.
// 'echo-only'             — every visitor, every visit, gets only the short
//                           echo. The full film's code (intro-scene.ts, the
//                           canvas journey, the route data) stays intact and
//                           untouched; this just stops it from being
//                           triggered, so flipping back later is a one-line
//                           change.
//
// URL overrides (useful for QA in production without changing the config
// default for real visitors):
//   ?intro=full   force the full film this visit, regardless of mode
//   ?intro=echo   force the echo this visit, regardless of mode
export type IntroMode = 'full-first-then-echo' | 'echo-only';

export const introMode: IntroMode = 'echo-only';
