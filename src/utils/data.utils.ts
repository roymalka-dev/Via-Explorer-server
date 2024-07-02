type Config = {
  [key: string]: string;
};

type ContentItem = {
  config: Config;
  deprecated: boolean;
  deprecated_properties: any[];
  "element-type": string;
  usage_status: string;
};

type Data = {
  content: {
    [key: string]: ContentItem[];
  };
};

type FormattedData = {
  id: string;
  [key: string]: string;
};

export const extractElementByType = (
  data: Data,
  elementType: string,
  newName: string
): FormattedData[] => {
  const formattedData: FormattedData[] = [];

  for (const [key, value] of Object.entries(data.content)) {
    if (value[0]["element-type"] === elementType) {
      const id = key;
      const elementValue = value[0].config[elementType];
      formattedData.push({ id, [newName]: elementValue });
    }
  }

  return formattedData;
};
