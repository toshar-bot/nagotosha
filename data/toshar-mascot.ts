export const TOSHAR_MASCOT_ASSETS = {
  welcome: {
    src: '/mascot/toshar-welcome.png',
    width: 2048,
    height: 2048,
    alt: '',
  },
  listen: {
    src: '/mascot/toshar-listen.png',
    width: 2048,
    height: 2048,
    alt: '',
  },
} as const;

export type TosharMascotPose = keyof typeof TOSHAR_MASCOT_ASSETS;
