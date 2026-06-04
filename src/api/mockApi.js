export const fetchLatestNews = async (sinceTimestamp = 0) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (Math.random() < 0.1) throw new Error("API Timeout");

  return [
    {
      id: Date.now() + 1,
      title: `Breaking News ${Date.now() + 1}`,
      timestamp: Date.now() + 100,
    },
    {
      id: Date.now() + 2,
      title: `Market Update ${Date.now() + 2}`,
      timestamp: Date.now() + 200,
    },
  ];
};
