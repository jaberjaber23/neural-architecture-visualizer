declare module 'react-katex' {
    import { ReactNode } from 'react';
  
    interface KaTeXProps {
      children?: string;
      math?: string;
      block?: boolean;
      errorColor?: string;
      renderError?: (error: Error | TypeError) => ReactNode;
      settings?: KaTeXSettings;
      as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
    }
  
    interface KaTeXSettings {
      displayMode?: boolean;
      throwOnError?: boolean;
      errorColor?: string;
      macros?: { [key: string]: string };
      colorIsTextColor?: boolean;
      maxSize?: number;
      maxExpand?: number;
      allowedProtocols?: string[];
      strict?: boolean | string | ((errorCode: string) => string);
      trust?: boolean | ((context: { command: string; url: string; protocol: string; }) => boolean);
    }
  
    export const InlineMath: React.FC<KaTeXProps>;
    export const BlockMath: React.FC<KaTeXProps>;
  
    export function Provider(props: { children: ReactNode; settings?: KaTeXSettings }): JSX.Element;
  }