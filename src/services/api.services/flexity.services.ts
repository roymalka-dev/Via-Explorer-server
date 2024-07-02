export const flexityServices = {
  getFlexityDataByElement: async (element: string) => {
    const FLEXITY_API_URL = process.env.FLEXITY_API_URL;

    const axios = require("axios");
    const url = `${FLEXITY_API_URL + element}&environment=prod`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
