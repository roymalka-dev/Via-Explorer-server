import { RequestHandler } from "express";
import { userService } from "../services/db.services/users.db.services";
import { appService } from "../services/db.services/app.db.services";
import { Request, Response } from "express";

export const userControllers = {
  /**
   * Controller for handling the retrieval of details for the currently authenticated user.
   *
   * Upon receiving a request, this controller first checks for the presence of the user's email in the session data.
   * If the user's email is not found, indicating that the user is not properly authenticated or the session data is incomplete,
   * it responds with a 400 status code and an appropriate error message.
   *
   * If the user's email is present, the controller proceeds to fetch the user's details from the database using the `userService`.
   * The fetched user details are then returned in the response with a 200 status code.
   *
   * In the event of an error during the database query or any other part of the process, the controller logs the error
   * and responds with a 500 status code, indicating an internal server error, along with a generic error message.
   *
   * @param {Request} req - The Express request object, expected to contain session data with the user's email.
   * @param {Response} res - The Express response object used to send back the user's details or an error message.
   */
  getUserDetailsController: async (req: Request, res: Response) => {
    try {
      const userEmail = req.session.user;

      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }

      const user = await userService.getUserDetails(userEmail);

      res.status(200).json({ data: user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching user details." });
    }
  },

  /**
   * Controller for fetching and returning a list of all users within the application.
   *
   * This controller handles the request to gather information on every user stored in the database. Upon invocation,
   * it uses the `userService` to query the database for all user records. The resulting list of users, including their
   * details, is then returned in the response with a 200 status code.
   *
   * Should there be any failure in retrieving the user data, such as a database connectivity issue or other internal errors,
   * the controller captures the error, logs it for debugging purposes, and returns a response with a 500 status code. This
   * indicates an internal server error, accompanied by a message informing the requester of the issue.
   *
   * @param {Request} req - The Express request object. This endpoint does not utilize any request parameters or body content.
   * @param {Response} res - The Express response object used for sending back the list of all users or an error message.
   */
  getAllUsersController: async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ data: users });
    } catch (error) {
      res
        .status(500)
        .json({ message: "An error occurred while fetching all users." });
    }
  },

  /**
   * Controller for editing user details based on provided email and role.
   * It processes the incoming request which should contain the user's email and new role within the body.
   * If the email is not provided, it responds with a 400 status code indicating a bad request.
   * On successful update, it returns the updated user data with a 200 status code.
   * If an error occurs during the update process, it logs the error and returns a 500 status code with an error message.
   *
   * @param {Request} req - The Express.js request object, expected to have a body containing 'email' and 'role'.
   * @param {Response} res - The Express.js response object used for sending back responses to the client.
   * @throws {Error} - Logs and sends a server error response if updating the user fails.
   */
  editUserDetailsController: async (req: Request, res: Response) => {
    try {
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ message: "User email is required." });
      }

      const user = await userService.updateUser(email, role);

      res.status(200).json({ data: user });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching user details." });
    }
  },

  /**
   * Controller for fetching and returning a list of a user's favorite items.
   *
   * This controller first validates the presence of the user's email in the session data to ensure the request is authenticated.
   * If the user's email is missing, it responds with a 400 status code and an error message indicating the requirement.
   *
   * Upon successful authentication, the controller uses the `userService` to obtain a list of favorite item IDs associated
   * with the user's email. These IDs are then used to fetch the corresponding items, potentially from multiple services
   * or databases, with this example assuming the items are apps and utilizing `appService` to fetch them.
   *
   * The fetched items are returned in the response with a 200 status code. In case of errors during the process, such as
   * failures in database queries or service calls, the controller logs the error and returns a response with a 500 status code,
   * indicating an internal server error, along with a generic error message.
   *
   * @param {Request} req - The Express request object, containing the session data with the user's email.
   * @param {Response} res - The Express response object used for sending back the list of favorite items or an error message.
   */
  getUserFavoritesController: async (req: Request, res: Response) => {
    try {
      const userEmail = req.session.user;

      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }

      const ids: string[] = await userService.getUserFavorites(userEmail);

      const apps = await appService.getAppsByIds(ids);

      const formattedApps = apps.map((app) => {
        return {
          id: app.id,
          name: app.name,
          city: app.city,
          imageUrl: app.imageUrl,
        };
      });

      res.status(200).json({ data: formattedApps });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching user favorites." });
    }
  },

  /**
   * Controller for toggling the favorite status of an item for the currently authenticated user.
   *
   * This controller extracts the user's email from the session and the item ID from the URL parameters.
   * It performs checks to ensure both the user's email and the item ID are present. If either is missing,
   * the controller responds with a 400 status code and an appropriate error message.
   *
   * Upon validation, the controller invokes the `toggleUserFavorite` method from `userService` to toggle the
   * favorite status of the specified item for the user. It then responds with a 200 status code and a success
   * message indicating the item's favorite status has been successfully toggled.
   *
   * In the event of an error during the toggle operation, such as a failure in database communication or issues
   * within the `userService`, the controller logs the error and returns a response with a 500 status code,
   * indicating an internal server error, along with a generic error message.
   *
   * @param {Request} req - The Express request object, containing the session data with the user's email and the item ID as a URL parameter.
   * @param {Response} res - The Express response object used for sending back a success message or an error message.
   */
  toggleUserFavoriteController: async (req: Request, res: Response) => {
    try {
      const userEmail = req.session.user;
      const favoriteItemId = req.params.id;

      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }

      if (!favoriteItemId) {
        return res
          .status(400)
          .json({ message: "Favorite item ID is required." });
      }

      // Call the userService's toggleUserFavorite method
      await userService.toggleUserFavorite(userEmail, favoriteItemId);

      res.status(200).json({ message: "Favorite item toggled successfully." });
    } catch (error) {
      console.error(`Error toggling favorite item for user`);
      res.status(500).json({
        message: "An error occurred while toggling the favorite item.",
      });
    }
  },

  /**
   * Controller for fetching and returning a list of apps that the user has recently viewed.
   *
   * Upon receiving a request, this controller first checks for the presence of the user's email in the session data.
   * If the user's email is not found, indicating that the user is not properly authenticated or the session data is incomplete,
   * it responds with a 400 status code and an error message.
   *
   * If the user's email is present, the controller proceeds to retrieve the list of app IDs corresponding to the apps that the user has recently viewed,
   * using the `userService`. These IDs are then used to fetch the corresponding apps' details, which are returned to the user.
   *
   * The fetched apps are returned in the response with a 200 status code. In case of errors during the process, such as
   * failures in database queries or service calls, the controller logs the error and returns a response with a 500 status code,
   * indicating an internal server error, along with a generic error message.
   *
   * @param {Request} req - The Express request object, containing the session data with the user's email.
   * @param {Response} res - The Express response object used for sending back the list of recently viewed apps or an error message.
   */
  getUserRecentlyViewedController: async (req: Request, res: Response) => {
    try {
      const userEmail = req.session.user;

      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }

      const ids: string[] = await userService.getRecentlyViewed(userEmail);

      const apps = await appService.getAppsByIds(ids);

      const formattedApps = apps.map((app) => {
        return {
          id: app.id,
          name: app.name,
          city: app.city,
          imageUrl: app.imageUrl,
        };
      });

      res.status(200).json({ data: formattedApps });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred while fetching user recently viewed apps.",
      });
    }
  },

  /**
   * Controller for fetching and returning a list of requests submitted by the user.
   *
   * This controller initiates by verifying the presence of the user's email within the session data, which serves as a means of authentication.
   * Should the user's email be absent, implying incomplete authentication or session data, it issues a response with a 400 status code accompanied by an error message.
   *
   * With the user's email successfully retrieved, the controller proceeds to fetch the list of requests associated with the user's email through the `userService`.
   * The acquired list of requests is then relayed back to the user in the response payload with a 200 status code.
   *
   * In instances where errors arise during the request retrieval process, such as database query failures or issues within the `userService`, the controller logs the error
   * and responds with a 500 status code, indicative of an internal server error, alongside a general error message.
   *
   * @param {Request} req - The Express request object, anticipated to contain the session data with the user's email.
   * @param {Response} res - The Express response object designated for dispatching back the list of user requests or an error message.
   */
  getUserRequestsController: async (req: Request, res: Response) => {
    try {
      const userEmail = req.session.user;

      if (!userEmail) {
        return res.status(400).json({ message: "User email is required." });
      }

      const requests = await userService.getUserRequests(userEmail);
      res.json({ data: requests });
    } catch (error) {
      console.error("Error fetching user requests:", error);

      res
        .status(500)
        .json({ message: "An error occurred while fetching user requests." });
    }
  },
};
