import { useState } from 'react';

export type InputKind = 'input-select' | 'input-indicator';

interface Option {
  id: string;
  point: number;
  title: string;
  type: InputKind;
  description?: string;
  isSelected?: boolean;
}
const MultiSelect = ({
  options,
  onSelect
}: {
  options: Option[];
  onSelect?: (v: any[]) => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<any[]>(
    options.filter(o => o.isSelected)
  );

  const handleOptionToggle = (option: Option) => {
    let updatedSelectedOptions;
    console.log(selectedOptions);

    if (selectedOptions.some(item => item.id === option.id)) {
      updatedSelectedOptions = selectedOptions.filter(
        selectedOption => selectedOption.id !== option.id
      );
    } else {
      updatedSelectedOptions = [...selectedOptions, option];
    }
    setSelectedOptions(updatedSelectedOptions);
    if (onSelect) {
      onSelect(updatedSelectedOptions);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col gap-6">
        {options?.map(option => (
          <button
            key={option.id}
            className={`flex items-center rounded-full h-[52px] ${
              selectedOptions.some(item => item.id === option.id)
                ? ' border-solid-gradient bg-[linear-gradient(to_right,#252525,#252525),linear-gradient(180deg,#EE1A21_0%,#902886_100%)] border bg-transparent'
                : 'border-solid border-[rgba(255,255,255,0.2)] border'
            }`}
            onClick={() => handleOptionToggle(option)}
          >
            <span className="w-full font-bold text-[14px] text-[#ccc] p-1 leading-[15px]">
              {option.title}
            </span>
            {/* <Image
              src="/images/20Gold_3x.png"
              width={40}
              height={40}
              alt="logo"
              className="w-auto h-auto"
              loading="eager"
            ></Image> */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultiSelect;
