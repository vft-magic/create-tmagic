
import React from 'react';

import { useApp } from '@tmagic/react-runtime-help';
import type { Id, MComponent } from '@tmagic/schema';

interface ComponentSchema extends Omit<MComponent, 'id'> {
  id?: Id;
  type?: string;
  text: string;
}

interface ButtonProps {
  config: ComponentSchema;
  className: string;
  id: string;
  style: Record<string, any>;
  containerIndex: number;
  iteratorIndex?: number[];
  iteratorContainerId?: Id[];
}

const Page: React.FC<ButtonProps> = ({
  id,
  config,
  className,
  style,
  containerIndex,
  iteratorIndex,
  iteratorContainerId,
}) => {
  const { app } = useApp({ config, iteratorIndex, iteratorContainerId });

  if (!app) return null;

  return (
    <div
      className={className}
      style={style}
      data-tmagic-id={`${id || config.id || ''}`}
      data-tmagic-container-index={containerIndex}
      data-tmagic-iterator-index={iteratorIndex}
      data-tmagic-iterator-container-id={iteratorContainerId}
    >
    </div>
  );
};

Page.displayName = 'magic-ui-component';

export default Page;
