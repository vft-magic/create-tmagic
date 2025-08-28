import { ActionType, type MApp, NodeType } from '@tmagic/core';

const dsl: MApp = {
  id: '1',
  name: 'test',
  type: NodeType.ROOT,
  codeBlocks: {
    code_5336: {
      name: 'getData',
      content: ({ app, params }) => {
        console.log('this is getData function', params, app);
      },
      params: [
        {
          name: 'age',
          type: 'number',
          tip: '年纪',
        },
        {
          name: 'studentName',
          type: 'text',
          tip: '学生姓名',
        },
      ],
    },
    code_5316: {
      name: 'getList',
      content: () => {
        console.log('this is getList function');
      },
      params: [],
    },
  },
  items: [
    {
      type: NodeType.PAGE,
      id: 'page_299',
      name: 'index',
      title: '',
      layout: 'absolute',
      style: {
        position: 'relative',
        left: 0,
        top: 0,
        right: '',
        bottom: '',
        width: '100%',
        height: '1728',
        backgroundImage: '',
        backgroundColor: 'rgba(248, 218, 218, 1)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        color: '',
        fontSize: '',
        fontWeight: '',
      },
      events: [
        {
          name: 'magic:common:events:click', // 事件名
          actions: [
            {
              actionType: ActionType.CODE, // 联动动作类型
              codeId: 'code_5336', // 代码块id
              params: {
                age: 12, // 参数
              },
            },
          ],
        },
        {
          name: 'magic:common:events:click', // 事件名
          actions: [
            {
              actionType: ActionType.CODE, // 联动动作类型
              codeId: 'code_5316', // 代码块id
              params: {},
            },
          ],
        },
      ],
      created: {
        hookType: 'code',
        hookData: [
          {
            codeId: 'code_5336',
            params: {
              studentName: 'lisa',
              age: 14,
            },
          },
          {
            codeId: 'code_5316',
            params: {},
          },
        ],
      },
      items: []
    },
  ],
  dataSources: [
  ],
};

export default dsl;
