"use client";

import { useState } from "react";
import { AddArticleForm } from "@/components/ui/AddArticleForm";
import { ArticleList } from "@/components/ui/ArticleList";
import { SpecialtyManager } from "@/components/ui/SpecialtyManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleArticleAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles">
          <div className="space-y-8">
            <AddArticleForm onArticleAdded={handleArticleAdded} />
            <ArticleList key={refreshTrigger} />
          </div>
        </TabsContent>
        
        <TabsContent value="categories">
          <SpecialtyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}