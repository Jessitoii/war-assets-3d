export default ({ config }) => {
  const apiKey = process.env.EXPO_PUBLIC_GCP_API_KEY;

  return {
    ...config,
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        googleMaps: {
          apiKey: apiKey || ""
        }
      }
    },
    android: {
      ...config.android,
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: apiKey || ""
        }
      }
    }
  };
};
