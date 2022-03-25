declare namespace DependencyGridScssNamespace {
  export interface IDependencyGridScss {
    addRows: string;
    btnSelected: string;
    dataTypeColDropdown: string;
    dataTypeHelp: string;
    deleteCol: string;
    depMvdCol: string;
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
    leftDepSideCol: string;
    optionsCol: string;
    orderCol: string;
    rightDepSideCol: string;
    scrollableGridRows: string;
    settingsIconCol: string;
    smallScreenMode: string;
    smallScreenSettingsTooltip: string;
    smallScreenSpinner: string;
    toggleMvdBtn: string;
  }
}

declare const DependencyGridScssModule: DependencyGridScssNamespace.IDependencyGridScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DependencyGridScssNamespace.IDependencyGridScss;
};

export = DependencyGridScssModule;
