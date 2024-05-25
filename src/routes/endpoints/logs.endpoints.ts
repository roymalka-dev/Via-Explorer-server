import { logsControllers } from "../../controllers/logs.controllers";
import { EndpointType } from "../../types/routes.types";

export const logsEndpoints: EndpointType[] = [
  {
    name: "get logs by date",
    method: "get",
    path: "/get-logs",
    controller: logsControllers.getLogsByDate,
    middleware: [],
    // authority: "ADMIN",
  },
];
