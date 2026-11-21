import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { loadFont as loadBricolage } from '@remotion/google-fonts/BricolageGrotesque';
import { loadFont as loadMono } from '@remotion/google-fonts/FragmentMono';
import { loadFont as loadHand } from '@remotion/google-fonts/Kalam';
import { loadFont as loadIBMArabic } from '@remotion/google-fonts/IBMPlexSansArabic';
import { STUDIO } from '../studio.config';
import { FONT as PURE_FONT } from './fonts.pure';

loadBricolage('normal', { weights: ['600', '700', '800'], subsets: ['latin'] });
loadMono('normal', { weights: ['400'], subsets: ['latin'] });
loadHand('normal', { weights: ['400', '700'], subsets: ['latin'] });
loadIBMArabic('normal', { weights: ['400', '500', '600', '700'], subsets: ['arabic', 'latin'] });
if (STUDIO.titleFont) loadFont({ family: STUDIO.titleFont.family, url: staticFile(STUDIO.titleFont.file), weight: STUDIO.titleFont.weight });

export const FONT = {
  ...PURE_FONT,
  title: STUDIO.titleFont ? STUDIO.titleFont.family : PURE_FONT.title,
};
