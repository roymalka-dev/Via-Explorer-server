import { publicControllers } from "../../controllers/public.controllers";
import { EndpointType } from "../../types/routes.types";

export const publicEndpoints: EndpointType[] = [
  {
    name: "get city data",
    method: "get",
    path: "/get-city-data/:id",
    controller: publicControllers.getCityData,
    middleware: [],
    authority: "PUBLIC",
  },
];
