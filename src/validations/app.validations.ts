import * as yup from "yup";

export const appValidationBodySchema = yup.object().shape({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  city: yup.string().required("City name is required"),
  country: yup.string().required("Country is required"),
  region: yup.string().optional(),
  version: yup.string().required("Version is required"),
  iosLink: yup.string().url("iOS link must be a valid URL"),
  androidLink: yup.string().url("Android link must be a valid URL"),
  iosBuilds: yup.array().of(yup.string()).optional(),
  androidBuilds: yup.array().of(yup.string()).optional(),
  imageUrl: yup.string().optional(),
});

export const appValidationParamsSchema = yup.object().shape({
  id: yup.string().required("ID is required"),
});

export const appsByIdsValidationBodySchema = yup.object().shape({
  ids: yup
    .array()
    .of(yup.string().required("Each ID is required"))
    .required("An array of IDs is required"),
});
export const multipleAppsValidationBodySchema = yup.object().shape({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  env: yup.string().required("Environment is required"),
  tenant: yup.string().required("Tenant is required"),
  city: yup.string().required("City is required"),
  country: yup.string().required("Country is required"),
  region: yup.string().required("Region is required"),
  iosVersion: yup.string().nullable(),
  iosLink: yup.string().url("Must be a valid URL").nullable(),
  iosRelease: yup.string().nullable(),
  iosFolder: yup.string().nullable(),
  iosBuilds: yup.array().of(yup.string()).nullable(),
  iosScreenshots: yup
    .array()
    .of(yup.string().url("Must be a valid URL"))
    .nullable(),
  androidVersion: yup.string().nullable(),
  androidRelease: yup.string().nullable(),
  androidFolder: yup.string().nullable(),
  androidLink: yup.string().url("Must be a valid URL").nullable(),
  androidBuilds: yup.array().of(yup.string()).nullable(),
  androidScreenshots: yup
    .array()
    .of(yup.string().url("Must be a valid URL"))
    .nullable(),
  languages: yup.array().of(yup.string()).nullable(),
  colorSpecs: yup.string().nullable(),
  figmaAppName: yup.string().nullable(),
  webAppFigmaLink: yup.string().url("Must be a valid URL").nullable(),
  webAppLink: yup.string().url("Must be a valid URL").nullable(),
  lastStoreUpdate: yup.number().nullable(),
  imageUrl: yup.string().url("Must be a valid URL").nullable(),
});

export const searchValidationQuerySchema = yup.object().shape({
  q: yup
    .string()
    .trim()
    .matches(/^[a-zA-Z0-9 \-_'"]*$/, {
      message: "Search query contains invalid characters",
    }),
});
