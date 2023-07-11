'use client';

import MarketItemDetails from '@components/MarketItemDetails';
import {
  MARKET_PLACE_FOOD_ITEMS,
  MARKET_PLACE_ITEMS
} from '@constants/mockups';
import { useMainLayoutContext } from '@hooks/use-main-layout-context';
import { useEffectOnce } from 'usehooks-ts';

export default function MarketPlacePage({ params: { marketPlaceId } }: any) {
  const { setConfig } = useMainLayoutContext();
  const marketItemDetails = [
    ...MARKET_PLACE_ITEMS,
    ...MARKET_PLACE_FOOD_ITEMS
  ].filter(
    (x: any) =>
      x.name.replace(/[^a-zA-Z0-9-_]/g, '') === marketPlaceId.toString()
  )[0];

  useEffectOnce(() => {
    setConfig({
      backHeader: {
        title: ''
      },
      showStat: false
    });
  });

  return (
    <div id="market-place-details">
      {marketItemDetails && <MarketItemDetails item={marketItemDetails} />}
    </div>
  );
}
