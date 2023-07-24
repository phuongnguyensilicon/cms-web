"use client";
import { apiCall } from "@/utils/api.util";
import { notify, useAsyncEffect } from "@/utils/client.util";
import 'flatpickr/dist/flatpickr.min.css';
import Joi from "joi";
import { useState } from "react";
import Flatpickr from 'react-flatpickr';

interface ContestDetailProps {
}

type FormValidate = {
  id?: string;
  startDate?: Date;
  startDateClone?: Date;
  endDate?: Date;
};

const schema = Joi.object({
  startDate: Joi.date().required().min(new Date()).less(Joi.ref('endDate', {
    adjust: val => val ? val : new Date(2100, 1, 1)
  })).messages({
    'string.empty': `Start is required.`,
    'any.required': `Start is required.`,
    'date.min': `Start must be greater than now.`,
    'date.less': `End must be greater than Start.`
  }),
  endDate: Joi.date().required().min(new Date()).greater(Joi.ref('startDateClone', {
    adjust: val => val ? val : new Date(1970, 1, 1)
  })).messages({
    'string.empty': `End is required.`,
    'any.required': `End is required.`,
    'date.min': `End must be greater than now.`,
    'date.greater': `End must be greater than Start.`
  })
}).options({allowUnknown: true});

const ContestDetail: React.FC<ContestDetailProps> = ({
}) =>  {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormValidate>({ id: "", startDate: undefined, endDate: undefined });
  const [errors, setErrors] = useState<any[]>([]);
  const [loadFormData, setLoadFormData] = useState<boolean>(false);
  const formatDate = 'Y-m-d h:i K';
  const [submitting, setSubmitting] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const submitForm = async () => {
    const isValid = setValidationErrors();
    if (!isValid || formData.id) {
      return;
    }
    setDisabled(true);
    setSubmitting(true);
    const payload = {
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };
    
    try {
      await apiCall("contest/create", { method: "POST", payload });
      notify(`Create successful`);
      setSubmitting(false);
    } catch (error) {
      notify("Failed to create contest", { type: "error" });      
    }

    setSubmitting(false);
  };

  const onDateChange = (isStartDate: boolean, date?: Date) => {
    if (isStartDate) {
      setFormData({...formData, startDate: date, startDateClone: date});
    } else {
      setFormData({...formData, endDate: date});
    }    
  };

  const setValidationErrors = (): boolean => {
    const { error } = schema.validate(formData, {
      abortEarly: false
    });
    if (error) {
      const validationErrors = error.details.map(detail => {
          const item = {
            name: detail.path[0],
            message: detail.message
          };
          return item;
        }
      );
      setErrors(validationErrors);
      return false;
    } else {
      setErrors([]);
    }
    return true;
  }

  const showError = (name: string) => {
    const error = errors.filter(x => x.name === name)[0];
    return error?.message;
  };
  
  const fechData = async () => {
    setLoading(true);

    const results = await apiCall("contest/current", {
      method: "GET",
    });

    if (results) {
      setFormData(results);
    } else {
      setDisabled(false);
    }
    setLoading(false);
  };

  useAsyncEffect(async () => {
    fechData();
  }, [loadFormData]);

  useAsyncEffect(async () => {
    if (!loading) {
      setValidationErrors();
    }
    
  }, [formData]);

  return (
    <>
      <div style={{flexFlow: "wrap"}}>
        <form>
          <div className="header py-2 flex">
            <div className="mb-2 relative" style={{marginRight: "5px"}}>
              <div>
                <span className="font-bold">Start:</span>          
              </div>
              <div>
                <Flatpickr
                    options={{ locale: "en", allowInput: false, altInput: false, enableTime: true, dateFormat: formatDate}} 
                    value={formData.startDate}
                    onChange={([date]) => {
                      onDateChange(true, date);
                    }}
                    disabled={disabled}
                    placeholder={''}
                    className="text-center w-full rounded-3xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
                  />
                  {showError("startDate") && (
                    <div className="error">{showError("startDate")}</div>
                  )}
              </div>
            </div>
            <div className="mb-2 relative" style={{marginLeft: "5px"}}>
            <div>
                <span className="font-bold">End:</span>          
              </div>
              <div>
                <Flatpickr
                  options={{ locale: "en", allowInput: false, altInput: false, enableTime: true, dateFormat: formatDate}} 
                  value={formData.endDate}
                  onChange={([date]) => {
                    onDateChange(false, date);
                  }}
                  disabled={disabled}
                  placeholder={''}
                  className="text-center w-full rounded-3xl border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 basis-11/12"
                />
                {showError("endDate") && (
                    <div className="error">{showError("endDate")}</div>
                  )}
              </div>
            </div>
          </div>
          <div className="mb-2 flex">
              <div>
                <button
                  onClick={e => {
                    e.preventDefault();
                    submitForm();
                  }}
                  className={`py-3 px-4 inline-flex gap-2 flex-shrink-0 justify-center items-center border rounded-3xl border-transparent font-semibold  text-white transition-all text-sm w-28 ${
                    submitting ? "cursor-not-allowed bg-indigo-400" : "bg-indigo-500"
                  }`}
                  style={{width: "auto"}}
                  disabled={disabled}
                >
                  {submitting && (
                    <span
                      className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                      role="status"
                      aria-label="loading"
                    ></span>
                  )}
                  Start Contest
                </button>
              </div>
          </div>
        </form>
        
      </div>
    </>
  );
}
export default ContestDetail;