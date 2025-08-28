import { Files, FolderOpened, Grid, PictureFilled, SwitchButton, Ticket, Tickets } from '@element-plus/icons-vue';

import type { ComponentGroup } from '@tmagic/editor';

export default [
  {
    title: '示例容器',
    items: [
      {
        icon: FolderOpened,
        text: '组',
        type: 'container',
      },
      {
        icon: Ticket,
        text: '页面片容器',
        type: 'page-fragment-container',
      },
      {
        icon: Files,
        text: '迭代器容器',
        type: 'iterator-container',
      },
    ],
  },
] as ComponentGroup[];
