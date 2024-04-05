import * as yup from "yup";

export const getS3PresignedUrlValidationBodySchema = yup.object().shape({
  bucketName: yup.string().required("ID is required"),
  fileName: yup.string().required("Name is required"),
  fileType: yup.string().required("City name is required"),
});
export const deleteS3ObjectalidationParamsSchema = yup.object().shape({
  bucketName: yup.string().required("ID is required"),
  fileName: yup.string().required("Name is required"),
});

export const appRequestValidationBodySchema = yup.object().shape({
  riderAppName: yup.string().required("Rider app name is required."),
  riderAppShortName: yup.string().required("Rider app short name is required."),
  launchDate: yup.string().required("Launch date is required."),
  jiraProjectLink: yup
    .string()
    .required("JIRA project link is required.")
    .url("JIRA project link must be a valid URL."),
  externalLinks: yup
    .array()
    .of(yup.string().url("Each external link must be a valid URL.")),
  serviceType: yup.string().required("Service type is required."),
  servicePaymentType: yup
    .string()
    .required("Service payment type is required."),
  autoSubscribe: yup.boolean().required("Auto subscribe flag is required."),
  autoSubscribeMessage: yup.string(),
  specialRequirements: yup.array().of(yup.string()),
  supportEmail: yup
    .string()
    .required("Support email is required.")
    .email("Support email must be a valid email."),
  languages: yup
    .array()
    .of(yup.string().required("At least one language is required.")),
  onBoarding: yup.array().of(yup.string()),
  subTitle: yup.array().of(yup.string()),
  whoBranded: yup
    .string()
    .required("Information about who branded is required."),
  serviceLogoImage: yup.string().required("Service logo image is required."),
  poweredBy: yup.string().required("Powered by information is required."),
  operatedBy: yup.string().required("Operated by information is required."),
  preferredTitle: yup.string().required("Preferred title is required."),
  providingAppLauncher: yup
    .boolean()
    .required("Providing app launcher flag is required."),
  appLauncher: yup.string(),
  skylineImage: yup.string(),
  skylineOption: yup.string(),
  VehicleOption: yup.string(),
  VehicleOptionImage: yup.string(),
  preferredBrandColor: yup.string(),
  chooseBrandColorFromLogo: yup
    .boolean()
    .required("Choose brand color from logo flag is required."),
  additionalInformation: yup.array().of(yup.string()),
});
