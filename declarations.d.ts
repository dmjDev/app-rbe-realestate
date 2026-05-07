declare module 'react-player/youtube' {
  import { ReactPlayerProps } from 'react-player';
  import { Component } from 'react';
  class ReactPlayer extends Component<ReactPlayerProps> { }
  export default ReactPlayer;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}