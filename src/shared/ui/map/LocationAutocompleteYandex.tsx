"use client";

import { useEffect, useState, type FC } from "react";

interface YandexPlace {
  name: string;
  description: string;
  fullAddress: string;
  coordinates: [number, number]; // [lng, lat]
}

interface LocationAutocompleteProps {
  onSelect: (place: YandexPlace) => void;
  placeholder?: string;
  defaultValue?: string;
}

type YandexGeoResponseItem = {
  GeoObject: {
    name: string;
    description: string;
    Point: {
      pos: string; // "76.9 43.25"
    };
  };
};

const LocationAutocompleteYandex: FC<LocationAutocompleteProps> = ({
  onSelect,
  placeholder = "Search for a location",
  defaultValue = "",
}) => {
  const [input, setInput] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<YandexPlace[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&geocode=${encodeURIComponent(
            `Алматы, ${input}`,
          )}&format=json`,
          { signal: controller.signal },
        );
        const data = await res.json();
        const results =
          (
            data.response.GeoObjectCollection
              .featureMember as YandexGeoResponseItem[]
          ).map((item) => {
            const geo = item.GeoObject;
            const coords = geo.Point.pos.split(" ").map(parseFloat);
            return {
              name: geo.name,
              description: geo.description,
              fullAddress: `${geo.name}, ${geo.description}`,
              coordinates: [coords[0], coords[1]] as [number, number],
            };
          }) || [];
        setSuggestions(results);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Yandex Geocoding error:", err);
        }
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [input]);

  const handleSelect = (place: YandexPlace) => {
    setInput(`${place.name}, ${place.description}`);
    setSuggestions([]);
    onSelect(place);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 100)}
        className="border p-3 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <li
              key={`${place.name}-${index}`}
              onClick={() => handleSelect(place)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <span className="font-semibold">{place.name}</span>
              <br />
              <span className="text-xs text-gray-500">{place.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocompleteYandex;
