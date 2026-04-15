import React from 'react';
import { SlideTimeline } from './SlideTimeline';
import { getThemeDefinition, getThemeIdForTemplate } from '../themes/registry';
import type { AudioSlideData } from '../templates/types';

interface SharedVideoProps {
  slides: AudioSlideData[];
  template?: string;
  soundtrackPath?: string;
  defaultSlideDuration?: number;
  preferSharedLayout?: boolean;
  subtitlesEnabled?: boolean;
  subtitleFont?: string;
}

export const SharedVideo: React.FC<SharedVideoProps> = ({
  slides,
  template,
  soundtrackPath,
  defaultSlideDuration = 150,
  preferSharedLayout = false,
  subtitlesEnabled = true,
  subtitleFont,
}) => {
  const themeId = getThemeIdForTemplate(template);
  const theme = getThemeDefinition(themeId);

  return (
    <SlideTimeline
      slides={slides}
      soundtrackPath={soundtrackPath}
      defaultSlideDuration={defaultSlideDuration}
      template={template}
      themeId={themeId}
      preferSharedLayout={preferSharedLayout}
      background={theme.palette.background}
      subtitlesEnabled={subtitlesEnabled}
      subtitleFont={subtitleFont}
    />
  );
};
