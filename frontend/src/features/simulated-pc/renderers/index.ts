import { CaseStoryRenderer } from './CaseStoryRenderer';
import { EmailSandboxRenderer } from './EmailSandboxRenderer';
import { ArticleSandboxRenderer } from './ArticleSandboxRenderer';
import type { SimulationContentType } from '../types';
import type { ComponentType } from 'react';
import { createElement } from 'react';

const rendererRegistry: Partial<Record<SimulationContentType, ComponentType>> = {
  'case-story': CaseStoryRenderer,
  'email-sandbox': EmailSandboxRenderer,
  'article-sandbox': ArticleSandboxRenderer,
};

export function getRenderer(type?: SimulationContentType): ComponentType {
  const Renderer = type ? rendererRegistry[type] : undefined;
  return (
    Renderer ??
    (() =>
      createElement(
        'div',
        {
          className:
            'flex h-screen items-center justify-center bg-black text-white',
        },
        `Unsupported content type: ${type ?? 'none'}`
      ))
  );
}
