import { useState, useEffect, useCallback } from "react";

import axios from "axios";

import { seeds } from "@stabilitydao/stability";

import type { TAddress } from "@types";

type TResult = {
  points: Record<TAddress, number>;
  totalPoints: number;
  isLoading: boolean;
};

export const usePoints = (): TResult => {
  const [points, setPoints] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const getPoints = useCallback(async () => {
    if (!seeds?.length) return;

    setIsLoading(true);

    try {
      const req = await axios.get(`${seeds[0]}/rewards/points`);

      if (req.data) setPoints(req.data);
    } catch (err) {
      console.error("Get points error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [seeds]);

  useEffect(() => {
    getPoints();
  }, []);

  const totalPoints = Object.values(points).reduce(
    (sum, value) => sum + value,
    0
  );

  return { points, totalPoints, isLoading };
};
