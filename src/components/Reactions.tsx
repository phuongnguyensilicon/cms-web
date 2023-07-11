import { REACTIONS } from '@constants/common';
import { useAsyncEffect } from '@helpers/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Coin from './Coin';

const reactionsSource: any[] = REACTIONS;

type Props = {
  selected?: any;
  options?: any[];
  onSelect: (value: any) => void;
};
export default function Reactions({ selected, options, onSelect }: Props) {
  const [optSelected, setOptSelected] = useState<any>();
  const [hasSelected] = useState<any>(selected);
  const [reactionList, setReactionList] = useState<any[]>();

  const onSelected = (selected: any) => {
    setOptSelected(selected);
    onSelect(selected);
  };

  const convertArrayOrder = (source: any[], target: any[]): any[] => {
    return target.map(item => {
      const a = source.find(
        sourceItem =>
          sourceItem.isWatched === item.isWatched &&
          sourceItem.isLiked === item.isLiked
      );
      return { ...a, ...item };
    });
  };

  useEffect(() => {
    setOptSelected(hasSelected);
  }, [hasSelected]);

  useAsyncEffect(() => {
    if (options?.length) {
      const thien = convertArrayOrder(options, reactionsSource);
      setReactionList(thien);
    }
  }, [options]);

  const Rating = () => {
    return (
      <div className="reaction-group">
        <div className="top-label">
          <div className="not-seen">
            <span className="label-text">Not Seen</span>
          </div>
          <div className="seen">
            <span className="label-text">Seen It</span>
          </div>
        </div>
        <div className="reaction-wrapper">
          <div className="reaction">
            {reactionList?.map((item, idx: number) => (
              <div className="reaction__item" key={idx}>
                <div className="flex flex-col" onClick={() => onSelected(item)}>
                  <Image
                    src={`${
                      !hasSelected
                        ? `${item?.icon}`
                        : `${item?.icon}${
                            optSelected?.id === item.id ? '' : '-disabled'
                          }`
                    }.png`}
                    width={100}
                    height={100}
                    alt="logo"
                    loading="eager"
                    className="mx-auto"
                  ></Image>
                </div>
              </div>
            ))}
          </div>
          <div id={`coin_five`} className="coin-five">
            <Coin
              value={5}
              className="text-[12px]"
              size={{ w: 28, h: 28 }}
              disabled={hasSelected}
            ></Coin>
          </div>
        </div>
      </div>
    );
  };
  return Rating();
}
