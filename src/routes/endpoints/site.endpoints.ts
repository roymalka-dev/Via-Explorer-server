import { siteControllers } from "../../controllers/site.controllers";
import { EndpointType } from "../../types/routes.types";

/**
 * Endpoints related to site.
 *
 * @type {EndpointType[]} appEndpoints
 */
export const siteEndpoints: EndpointType[] = [
  {
    name: "get latest announcements",
    method: "get",
    path: "/get-latest-announcements",
    controller: siteControllers.getLatestAnnouncements,
    middleware: [],
    authority: "USER",
  },
];
