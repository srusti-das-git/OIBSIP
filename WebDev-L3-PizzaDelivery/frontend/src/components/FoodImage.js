import { useEffect, useState } from 'react';

const cache = {};

const fetchPhoto = (query) => {
  if (cache[query] !== undefined) return Promise.resolve(cache[query]);
  return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const thumb = data?.originalimage?.source || data?.thumbnail?.source || null;
      cache[query] = thumb;
      return thumb;
    })
    .catch(() => {
      cache[query] = null;
      return null;
    });
};

export const useFoodImage = (query) => {
  const [src, setSrc] = useState(cache[query] !== undefined ? cache[query] : undefined);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    fetchPhoto(query).then((thumb) => {
      if (!cancelled) setSrc(thumb);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return src;
};

const FoodImage = ({ query, fallbackEmoji = '🍕', size = 64, className = '' }) => {
  const src = useFoodImage(query);

  if (!src) {
    return (
      <span
        className={`food-img-fallback ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.45, lineHeight: `${size}px` }}
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={query}
      className={`food-img ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default FoodImage;