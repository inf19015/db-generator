declare namespace DependencyGridScssNamespace {
  export interface IDependencyGridScss {
    addRows: string;
    dataTypeCol: string;
    dataTypeColDropdown: string;
    dataTypeHelp: string;
    deleteCol: string;
    disabledBtn: string;
    examplesCol: string;
    grid: string;
    gridHeader: string;
    gridHeaderWrapper: string;
    gridMedium: string;
    gridOverlay: string;
    gridRow: string;
    gridRowsWrapper: string;
    gridSmall: string;
    gridWrapper: string;
    optionsCol: string;
    orderCol: string;
    scrollableGridRows: string;
    settingsIconCol: string;
    smallScreenMode: string;
    smallScreenSettingsTooltip: string;
    smallScreenSpinner: string;
    titleCol: string;
  }
}

declare const DependencyGridScssModule: DependencyGridScssNamespace.IDependencyGridScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DependencyGridScssNamespace.IDependencyGridScss;
};

export = DependencyGridScssModule;
