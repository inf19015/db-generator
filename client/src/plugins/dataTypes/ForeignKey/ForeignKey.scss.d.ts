declare namespace ForeignKeyScssNamespace {
  export interface IForeignKeyScss {
    buttonLabel: string;
    fieldRow: string;
    fieldsRow: string;
  }
}

declare const ForeignKeyScssModule: ForeignKeyScssNamespace.IForeignKeyScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ForeignKeyScssNamespace.IForeignKeyScss;
};

export = ForeignKeyScssModule;
