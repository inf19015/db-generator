declare namespace TablesScssNamespace {
  export interface ITablesScss {
    OuterBox: string;
    TabBox: string;
    TabLabel: string;
    TabLabelContent: string;
    TabLabelDelete: string;
    TabLabelEdit: string;
    TabPanel: string;
    TabPanelBox: string;
  }
}

declare const TablesScssModule: TablesScssNamespace.ITablesScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TablesScssNamespace.ITablesScss;
};

export = TablesScssModule;
