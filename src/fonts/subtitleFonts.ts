import { loadFont as loadNotoSansSC } from '@remotion/google-fonts/NotoSansSC';
import { loadFont as loadNotoSerifSC } from '@remotion/google-fonts/NotoSerifSC';
import { loadFont as loadZCOOLQingKeHuangYou } from '@remotion/google-fonts/ZCOOLQingKeHuangYou';
import { loadFont as loadZCOOLKuaiLe } from '@remotion/google-fonts/ZCOOLKuaiLe';
import { loadFont as loadZCOOLXiaoWei } from '@remotion/google-fonts/ZCOOLXiaoWei';
import { loadFont as loadMaShanZheng } from '@remotion/google-fonts/MaShanZheng';
import { loadFont as loadLongCang } from '@remotion/google-fonts/LongCang';
import { loadFont as loadLiuJianMaoCao } from '@remotion/google-fonts/LiuJianMaoCao';

export type SubtitleFontId =
  | 'noto-sans-sc'
  | 'noto-serif-sc'
  | 'zcool-qingke-huangyou'
  | 'zcool-kuaile'
  | 'zcool-xiaowei'
  | 'ma-shan-zheng'
  | 'long-cang'
  | 'liu-jian-mao-cao';

export const DEFAULT_SUBTITLE_FONT: SubtitleFontId = 'noto-sans-sc';

interface SubtitleFontDefinition {
  id: SubtitleFontId;
  label: string;
  description: string;
  load: () => { fontFamily: string };
}

export const SUBTITLE_FONTS: SubtitleFontDefinition[] = [
  {
    id: 'noto-sans-sc',
    label: '思源黑体',
    description: '清爽中性，最稳妥',
    load: () => loadNotoSansSC('normal', { weights: ['900'] }),
  },
  {
    id: 'zcool-qingke-huangyou',
    label: '站酷庆科黄油体',
    description: '粗黑有冲击，适合短视频',
    load: () => loadZCOOLQingKeHuangYou('normal', { weights: ['400'] }),
  },
  {
    id: 'zcool-kuaile',
    label: '站酷快乐体',
    description: '饱满圆润，有亲和力',
    load: () => loadZCOOLKuaiLe('normal', { weights: ['400'] }),
  },
  {
    id: 'zcool-xiaowei',
    label: '站酷小薇',
    description: '纤细雅致',
    load: () => loadZCOOLXiaoWei('normal', { weights: ['400'] }),
  },
  {
    id: 'noto-serif-sc',
    label: '思源宋体',
    description: '正式、有质感',
    load: () => loadNotoSerifSC('normal', { weights: ['900'] }),
  },
  {
    id: 'ma-shan-zheng',
    label: '马善政书',
    description: '毛笔楷书风',
    load: () => loadMaShanZheng('normal', { weights: ['400'] }),
  },
  {
    id: 'long-cang',
    label: '龙藏体',
    description: '细行楷',
    load: () => loadLongCang('normal', { weights: ['400'] }),
  },
  {
    id: 'liu-jian-mao-cao',
    label: '刘建毛草',
    description: '狂草手写',
    load: () => loadLiuJianMaoCao('normal', { weights: ['400'] }),
  },
];

const fontMap: Record<string, SubtitleFontDefinition> = Object.fromEntries(
  SUBTITLE_FONTS.map((font) => [font.id, font])
);

export const getSubtitleFontDefinition = (
  id?: string | null
): SubtitleFontDefinition => {
  return (
    (id && fontMap[id]) || fontMap[DEFAULT_SUBTITLE_FONT] || SUBTITLE_FONTS[0]
  );
};

/**
 * Loads the selected subtitle font via @remotion/google-fonts and returns
 * the CSS font-family string. Safe to call in a component render (cached).
 */
export const resolveSubtitleFontFamily = (id?: string | null): string => {
  const def = getSubtitleFontDefinition(id);
  return def.load().fontFamily;
};
