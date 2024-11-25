import { DataSource, type DataSourceOptions } from '@tmagic/data-source';
import type { DataSourceSchema } from '@tmagic/schema';

export interface MyDataSourceOptions extends DataSourceOptions {
  schema: DataSourceSchema & {};
}

export default class MyDataSource extends DataSource {
  constructor(options: MyDataSourceOptions) {
    super(options);
  }

  public async init() {
    super.init();
  }
}
