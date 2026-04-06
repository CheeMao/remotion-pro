import React from 'react';
import { SharedVideo } from '../renderers/SharedVideo';
import type { AudioSlideData } from './types';

export const GeneratedTemplateRenderer: React.FC<{
  template: string;
  slides: Array<Record<string, unknown>>;
  soundtrackPath?: string;
}> = ({ template, slides, soundtrackPath }) => {
  return (
    <SharedVideo
      template={template}
      slides={slides as unknown as AudioSlideData[]}
      soundtrackPath={soundtrackPath}
    />
  );
};
