declare namespace GridContainerScssNamespace {
  export interface IGridContainerScss {
    controlRow: string;
    disabled: string;
    icons: string;
    incompatibleBrowser: string;
  }
}

declare const GridContainerScssModule: GridContainerScssNamespace.IGridContainerScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: GridContainerScssNamespace.IGridContainerScss;
};

export = GridContainerScssModule;
