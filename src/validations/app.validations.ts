import * as yup from "yup";

export const appValidationBodySchema = yup.object().shape({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  queryName: yup.string().optional(),
  iosAppId: yup.string().required("iOS App ID is required"),
  androidAppId: yup.string().required("Android App ID is required"),
  env: yup.string().required("Environment is required"),
  tenant: yup.string().required("Tenant is required"),
  city: yup.string().required("City name is required"),
  country: yup.string().required("Country is required"),
  region: yup.string().optional(),
  iosVersion: yup.string().optional(),
  iosLink: yup.string().url("iOS link must be a valid URL").optional(),
  iosRelease: yup.string().optional(),
  iosFolder: yup.string().optional(),
  iosBuilds: yup.array().of(yup.string()).optional(),
  iosScreenshots: yup.array().of(yup.string()).optional(),
  iosCurrentVersionReleaseDate: yup.string().optional(),
  androidVersion: yup.string().optional(),
  androidRelease: yup.string().optional(),
  androidFolder: yup.string().optional(),
  androidLink: yup.string().url("Android link must be a valid URL").optional(),
  androidBuilds: yup.array().of(yup.string()).optional(),
  androidScreenshots: yup.array().of(yup.string()).optional(),
  androidCurrentVersionReleaseDate: yup.string().optional(),
  languages: yup.array().of(yup.string()).optional(),
  colorSpecs: yup.string().optional(),
  figmaAppName: yup.string().optional(),
  webAppFigmaLink: yup
    .string()
    .url("Web App Figma Link must be a valid URL")
    .optional(),
  webAppLink: yup.string().url("Web App Link must be a valid URL").optional(),
  lastStoreUpdate: yup.number().optional(),
  imageUrl: yup.string().url("Image URL must be a valid URL").optional(),
  pso: yup.string().optional(),
  psm: yup.string().optional(),
});

export const updateAppValidationBodySchema = yup.object().shape({
  id: yup.string().required("ID is required"),
  name: yup.string().required("Name is required"),
  city: yup.string().required("City name is required"),
  country: yup.string().required("Country is required"),
  region: yup.string().optional(),
  iosFolder: yup.string().nullable(),
  androidFolder: yup.string().nullable(),
  colorSpecs: yup.string().nullable(),
  figmaAppName: yup.string().nullable(),
  webAppFigmaLink: yup.string().url("Must be a valid URL").nullable(),
  webAppLink: yup.string().url("Must be a valid URL").nullable(),
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
