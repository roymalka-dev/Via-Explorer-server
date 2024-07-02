import { appControllers } from "../../controllers/app.controllers";
import { EndpointType } from "../../types/routes.types";

export const testEndpoints: EndpointType[] = [
  {
    name: "update-city-status-from-flexity",
    method: "get",
    path: "/update-city-status-from-flexity",
    controller: appControllers.updateCityStatusFromFlexity,
    middleware: [],
    authority: "PUBLIC",
  },
];
