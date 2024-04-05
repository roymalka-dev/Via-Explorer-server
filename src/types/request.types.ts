export type RequestType = {
  [key: string]: string | number | boolean | string[] | Date | undefined;
};

export interface AppRequestType extends RequestType {
  riderAppName: string;
  riderAppShortName: string;
  launchDate: string;
  jiraProjectLink: string;
  externalLinks: string[];
  serviceType: string;
  servicePaymentType: string;
  autoSubscribe: boolean;
  autoSubscribeMessage: string;
  specialRequirements: string[];
  supportEmail: string;
  languages: string[];
  onBoarding: string[];
  subTitle: string[];
  whoBranded: string;
  serviceLogoImage: string;
  poweredBy: string;
  operatedBy: string;
  preferredTitle: string;
  providingAppLauncher: boolean;
  appLauncher?: string;
  skylineImage?: string;
  skylineOption?: string;
  VehicleOption?: string;
  VehicleOptionImage?: string;
  preferredBrandColor?: string;
  chooseBrandColorFromLogo: boolean;
  additionalInformation: string[];
}
