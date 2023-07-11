'use client';
import { ROUTERS } from '@configs/common';
import {
  formatDateInput,
  formatUsernameInput,
  toTitleCase
} from '@helpers/ultis';
import { isInvalidDateOfBirth, isValidUsername } from '@helpers/validation';
import '@scss/user.scss';
import { UserService } from '@services/user';
import Joi from 'joi';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type FormData = {
  userName: string;
  dob: string;
  city: string;
  state: string;
  gender: string;
};

const schema = Joi.object<FormData>({
  userName: Joi.string().required().label('Username'),
  dob: Joi.string().required().label('Date of birth'),
  city: Joi.string().required().label('City'),
  state: Joi.string().required().label('State'),
  gender: Joi.string().required().label('Gender')
});

interface Props {
  profile: FormData;
}

export default function UserProfile({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update: updatedSession } = useSession();
  const [formData, setFormData] = useState<FormData>(profile);

  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoaded, setLoaded] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    if (isSuccess) {
      if (pathname === ROUTERS.userProfileSetup) {
        router.push(ROUTERS.userSubscribe);
      } else {
        router.push(ROUTERS.userProfile);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    // Validate form data
    const { error } = schema.validate(formData, {
      abortEarly: false
    });
    if (error) {
      const validationErrors = error.details.map(detail =>
        detail.message
          .replace('not allowed to be empty', 'required')
          .replaceAll('"', '')
      );
      setErrors(validationErrors);
    } else {
      // Clear errors
      setErrors([]);
    }
    setLoaded(true);
  }, [formData]);

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prevTouchedFields => ({
      ...prevTouchedFields,
      [fieldName]: true
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formatInput: string;
    const { name, value } = e.target;

    switch (name) {
      case 'userName':
        if (!value) {
          setError('');
        }
        formatInput = formatUsernameInput(value);
        break;

      case 'dob':
        formatInput = formatDateInput(value);
        break;

      case 'gender':
        formatInput = value.toLocaleLowerCase();
        break;

      default:
        formatInput = toTitleCase(value);
        break;
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: formatInput
    }));
  };

  const isDisabled = () => !isLoaded || errors.length > 0 || isSubmitting;
  const showError = (name: string) => {
    return errors.filter(x => x.indexOf(name) === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const { error } = schema.validate(formData, {
      abortEarly: false
    });
    if (error) {
      const validationErrors = error.details.map(detail => detail.message);
      setErrors(validationErrors);
    } else {
      // Clear errors
      setErrors([]);

      UserService.updateProfile(
        { ...formData },
        session,
        updatedSession,
        setSuccess,
        setError,
        setSubmitting
      );
    }
  };

  const onBlurClassName = (name: string, isBoolean: boolean) => {
    return `${touchedFields[name] ? (isBoolean ? 'success' : 'error') : ''}`;
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <div className="relative">
        <input
          name="userName"
          placeholder="Username"
          value={formData.userName}
          onChange={handleChange}
          onBlur={() => handleFieldBlur('user')}
          className={onBlurClassName(
            'user',
            isValidUsername(formData.userName)
          )}
        />
        <label className="peer-focus:text-[11px]">Choose a username</label>
        <ul className="error">
          {touchedFields['user'] &&
            showError('Username').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          {touchedFields['user'] &&
            !!formData.userName &&
            !isValidUsername(formData.userName) && (
              <li>
                Username must be at least 3 characters and contain only letters,
                numbers, or underscore character and begins with a letter.
              </li>
            )}
          {error && error.includes('already taken') && <li>{error}</li>}
        </ul>
      </div>

      <div className="relative">
        <input
          name="dob"
          placeholder="MM/DD/YYYY"
          value={formData.dob}
          onChange={handleChange}
          maxLength={10}
          onBlur={() => handleFieldBlur('dob')}
          className={onBlurClassName(
            'dob',
            !isInvalidDateOfBirth(formData.dob)
          )}
        />
        <label className="peer-focus:text-[11px]">Date of birth</label>
        <ul className="error">
          {touchedFields['dob'] &&
            showError('Date of birth').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          {formData.dob.length === 10 && isInvalidDateOfBirth(formData.dob) && (
            <li>{isInvalidDateOfBirth(formData.dob)}</li>
          )}
        </ul>
      </div>

      <div className="relative">
        <input
          name="city"
          placeholder="Name of City"
          value={formData.city}
          onChange={handleChange}
          onBlur={() => handleFieldBlur('city')}
          className={onBlurClassName('city', formData.city.length > 0)}
        />
        <label className="peer-focus:text-[11px]">City</label>
        <ul className="error">
          {touchedFields['city'] &&
            showError('City').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
        </ul>
      </div>

      <div className="relative">
        <input
          name="state"
          placeholder="Name of State"
          value={formData.state}
          onChange={handleChange}
          onBlur={() => handleFieldBlur('state')}
          className={onBlurClassName('state', formData.state.length > 0)}
        />
        <label className="peer-focus:text-[11px]">State</label>
        <ul className="error">
          {touchedFields['state'] &&
            showError('State').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
        </ul>
      </div>

      <div className="gender">
        Gender
        <div className="grid grid-cols-3">
          <div className="flex">
            <input
              type="radio"
              name="gender"
              id="male"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('gender')}
            />
            <label htmlFor="male">Male</label>
          </div>
          <div className="flex">
            <input
              type="radio"
              name="gender"
              id="female"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('gender')}
            />
            <label htmlFor="female">Female</label>
          </div>
          <div className="flex">
            <input
              type="radio"
              name="gender"
              id="other"
              value="other"
              checked={formData.gender === 'other'}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('gender')}
            />
            <label htmlFor="other">Other</label>
          </div>
        </div>
        <ul className="error">
          {touchedFields['gender'] &&
            showError('Gender').map((error, index) => (
              <li key={index}>{error}</li>
            ))}
        </ul>
      </div>

      {error && !error.includes('already taken') && (
        <div className="error">{error}</div>
      )}

      <button
        disabled={isDisabled()}
        className={isDisabled() ? 'disabled' : ''}
      >
        {pathname === ROUTERS.userProfileSetup ? (
          <>{isSubmitting && !isSuccess ? 'Submitting...' : 'Continue'}</>
        ) : (
          <>{isSubmitting && !isSuccess ? 'Saving...' : 'Save'}</>
        )}
      </button>
    </form>
  );
}
