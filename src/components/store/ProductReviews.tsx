"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Avaliações de Clientes</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-secondary rounded-2xl w-full"></div>
          <div className="h-24 bg-secondary rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="mt-20 mb-10">
      <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8">Avaliações de Clientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-secondary/30 p-6 rounded-2xl border border-border/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-foreground">{review.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-border"}`}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-foreground/90 leading-relaxed">
                "{review.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
