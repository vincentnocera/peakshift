"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast"


interface Article {
  id: string;
  text: string;
  specialty: string;
  subtopic: string;
  dateAdded: string;
}

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch articles on component mount
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/get-articles');
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      toast({ variant: "destructive", description: "Error loading articles" });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/delete-article`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete article');
      
      // Remove article from local state
      setArticles(articles.filter(article => article.id !== id));
      toast({ description: "Article deleted successfully" });
    } catch (error) {
      toast({ variant: "destructive", description: "Error deleting article" });
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading articles...</div>;
  }

  if (articles.length === 0) {
    return <div className="text-center py-4">No articles found.</div>;
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div 
          key={article.id} 
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">{article.specialty}</h3>
              <p className="text-sm text-gray-600">{article.subtopic}</p>
            </div>
            <button
              onClick={() => handleDelete(article.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
          
          {/* Preview of the article text (first 200 characters) */}
          <p className="text-gray-700 text-sm">
            {article.text.slice(0, 200)}
            {article.text.length > 200 ? '...' : ''}
          </p>
          
          <p className="text-xs text-gray-500 mt-2">
            Added: {new Date(article.dateAdded).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
} 