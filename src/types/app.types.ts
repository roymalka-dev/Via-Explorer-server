export type appBuildVersionType = {
  version: string;
  link: string;
};

export type AppType = {
  id: string;
  name: string;
  queryName?: string;
  env: string;
  tenant: string;
  city: string;
  country: string;
  region: string;
  iosVersion?: string;
  iosLink?: string;
  iosRelease?: string;
  iosFolder?: string;
  iosBuilds?: appBuildVersionType[];
  iosScreenshots?: string[];
  androidVersion?: string;
  androidRelease?: string;
  androidFolder?: string;
  androidLink?: string;
  androidBuilds?: appBuildVersionType[];
  androidScreenshots?: string[];
  languages?: string[];
  colorSpecs?: string;
  figmaAppName?: string;
  webAppFigmaLink?: string;
  webAppLink?: string;
  lastStoreUpdate?: number;
  imageUrl?: string;
  pso?: string;
  psm?: string;
};
