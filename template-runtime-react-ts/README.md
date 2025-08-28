## 本地调试

首次使用或者tmagic.config.ts有修改，执行
```
npm run tmagic
npm run build:libs
```

然后启动devserver
```
npm run dev
```

## 本地配置
再项目根目录下新建tmagic.config.loacl.ts文件，与tmagic.config.ts是一样的结构，local文件会与tmagic.config.ts合并并覆盖它

使用场景举例：当tmagic.config.ts中的packages配置的是npm包时，再开发时想使用本地代码，则可以在local文件中配置成本地路径

例如：
```
// tmagic.config.ts

import { defineConfig } from '@tmagic/cli';

export default defineConfig({
  packages: [
    { container: '@tmagic/vue-container' },
    // 其他组件配置
  ],
  // 其他配置
});
```

```
// tmagic.config.local.ts

import { defineConfig } from '@tmagic/cli';

export default defineConfig({
  packages: [
    { container: '/data/user/components/vue-container' },
    // 其他组件配置
  ],
  // 其他配置
});
```
