import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';

import React, { useEffect, useState } from 'react';
interface DatePickerProps {
  onChange: (selectedDate?: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}
const DatePicker: React.FC<DatePickerProps> = ({
  onChange,
  placeholder = 'Select a date',
  className = '',
  value = ''
}) => {
  const [val, setValue] = useState<Date|undefined>(undefined);

  useEffect(() => {
    if (!value) {
      setValue(undefined);
    } else {
      const date = new Date(value);
      const dateConvert = date.getTime() + date .getTimezoneOffset()*60000;
      setValue(new Date(dateConvert));
    }
  }, [value]);

  const onDateChange = (date?: Date) => {
    setValue(date);
    onChange(date ? date.toLocaleDateString(): undefined);
  }
  return (
        <Flatpickr
          options={{ locale: "en", allowInput: false, altInput: false }} 
          value={val}
          onChange={([date]) => {
            onDateChange(date);
          }}
          placeholder={placeholder}
          className={className}
        />
  );
};
export default DatePicker;