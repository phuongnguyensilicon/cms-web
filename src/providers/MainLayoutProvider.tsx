'use client';
import { UserService } from '@services/user';
import { useSession } from 'next-auth/react';
import { createContext, useEffect, useState } from 'react';

export type MainLayoutConfig = {
  backHeader?: {
    title?: string;
    action?: {
      name: string;
      path: string;
    };
  };
  showStat?: boolean;
  stats?: {
    totalDiscountClaim?: number;
    totalDislike?: number;
    totalLike?: number;
    totalWatchlist?: number;
  };
  levels?: {
    level?: number;
    point?: number;
    pointRequire?: number;
    nextLevel?: number;
    nextPointRequire?: number;
    completePercentage?: number;
  };
};

const defaultConfig: MainLayoutConfig = {
  backHeader: {},
  showStat: true,
  stats: {},
  levels: {}
};

export type MainLayoutContextValue = {
  data: MainLayoutConfig;
  setConfig: (newVal: MainLayoutConfig) => void;
  fetchData: () => Promise<void>;
};

export const MainLayoutContext = createContext<
  MainLayoutContextValue | undefined
>(undefined);

function MainLayoutProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MainLayoutConfig>({});
  const [levels, setLevels] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const { status: statusSession }: any = useSession();
  const [, setLoading] = useState(false);
  const [, setError] = useState('');

  const setConfig = (newData: MainLayoutConfig) => {
    const merged = { ...defaultConfig, ...newData };
    setData(merged);
  };

  useEffect(() => {
    if (Object.keys(levels).length) {
      setData(prev => ({
        ...prev,
        ...{ levels }
      }));
    }
  }, [levels]);

  useEffect(() => {
    if (Object.keys(stats).length) {
      setData(prev => ({
        ...prev,
        ...{ stats }
      }));
    }
  }, [stats]);

  const fetchData = async () => {
    if (statusSession === 'authenticated') {
      UserService.getStats(setStats, setError, setLoading);
      UserService.getLevel(setLevels, setError, setLoading);
    }
  };

  const contextValue: MainLayoutContextValue = {
    data,
    setConfig,
    fetchData
  };

  return (
    <MainLayoutContext.Provider value={contextValue}>
      {children}
    </MainLayoutContext.Provider>
  );
}

export default MainLayoutProvider;
