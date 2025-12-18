"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/app/state";

const HeroSection = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );

      const data = await response.json();

      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;

        // ✅ Save filters in Redux
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [lat, lng],
          })
        );

        // ✅ Redirect to search page
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: lat.toString(),
          lng: lng.toString(),
        });

        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/landing-splash.jpg"
        alt="Rental platform hero section"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center text-center"
      >
        <div className="max-w-4xl px-6 sm:px-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Start your journey to finding the perfect place to call home
          </h1>

          <p className="text-lg sm:text-xl text-white mb-8">
            Explore rental properties tailored to your lifestyle and needs
          </p>

          {/* Search Bar */}
          <div className="flex justify-center">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, neighborhood or address"
              className="w-full max-w-lg h-12 rounded-none rounded-l-xl border-none bg-white text-gray-800"
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
            />

            <Button
              onClick={handleLocationSearch}
              className="h-12 rounded-none rounded-r-xl bg-gray-400 hover:text-white hover:bg-gray-600 text-gray-700 px-6"
            >
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
