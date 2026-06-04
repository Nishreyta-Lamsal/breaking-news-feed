"use client";

import React, { useEffect, useRef, useState } from "react";
import { fetchLatestNews } from "../../api/mockApi";

type NewsArticle = {
  id: number;
  title: string;
  timestamp: number;
};

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [pendingArticles, setPendingArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latestTimestampRef = useRef(0);
  const isPollingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadInitialNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const news = await fetchLatestNews(0);

        if (!isMounted) return;

        setArticles(news);

        if (news.length > 0) {
          latestTimestampRef.current = Math.max(
            ...news.map((article) => article.timestamp),
          );
        }
      } catch (err) {
        if (!isMounted) return;

        setError(err instanceof Error ? err.message : "Failed to fetch news");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const pollForUpdates = async () => {
      if (isPollingRef.current) return;

      isPollingRef.current = true;

      try {
        const news = await fetchLatestNews(latestTimestampRef.current);

        if (!isMounted || news.length === 0) {
          return;
        }

        setPendingArticles((prev) => {
          const existingIds = new Set(prev.map((article) => article.id));

          const uniqueNews = news.filter(
            (article) => !existingIds.has(article.id),
          );

          return [...uniqueNews, ...prev];
        });

        latestTimestampRef.current = Math.max(
          latestTimestampRef.current,
          ...news.map((article) => article.timestamp),
        );
      } catch (err) {
        console.error("Polling failed:", err);
      } finally {
        isPollingRef.current = false;
      }
    };

    loadInitialNews();

    const intervalId = setInterval(pollForUpdates, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleLoadNewArticles = () => {
    setArticles((prev) => [...pendingArticles, ...prev]);

    setPendingArticles([]);
  };

  if (loading) {
    return <p>Loading news...</p>;
  }

  return (
    <div className="news-feed">
      <h1>Breaking News</h1>

      {error && <p className="text-red-600">Error: {error}</p>}

      {pendingArticles.length > 0 && (
        <button onClick={handleLoadNewArticles}>
          Load {pendingArticles.length} new articles
        </button>
      )}

      {articles.map((article) => (
        <div
          key={article.id}
          className="border border-gray-200 p-4 mt-4"
        >
          <h3>{article.title}</h3>
          <small>{article.timestamp}</small>
        </div>
      ))}
    </div>
  );
}
