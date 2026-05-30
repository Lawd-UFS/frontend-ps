import { HttpMethod, HttpClient } from '../../infra/http/httpClient.js';

const client = HttpClient.create();

export async function sendFormData(data) {
  try {
    const response = await client.sendRequest({
      method: HttpMethod.POST,
      endpoint: '/candidatos',
      body: data,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      errors: error.errorData?.errors,
    };
  }
}

function fieldIsFilled(field) {
  const value = field.value.trim();

  if (!value) {
    return false;
  }

  return true;
}

export function checkRequiredFields(form) {
  const invalidFields = [];

  form.querySelectorAll('label').forEach((label) => {
    if (label.getAttribute('for') === 'source') {
      const checkedBoxes = label.querySelectorAll(
        'input[type="checkbox"]:checked',
      );
      if (checkedBoxes.length === 0) {
        invalidFields.push(label);
      }
      return;
    }

    const requiredField = label.querySelector('[required]');
    if (!requiredField) {
      return;
    }

    if (!fieldIsFilled(requiredField)) {
      invalidFields.push(label);
      return;
    }

    if (requiredField.type === 'email' || requiredField.name === 'email') {
      const emailVal = requiredField.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        invalidFields.push(label);
        return;
      }
    }

    if (requiredField.type === 'number') {
      const numVal = parseInt(requiredField.value, 10);
      const min = parseInt(requiredField.getAttribute('min'), 10);
      const max = parseInt(requiredField.getAttribute('max'), 10);
      if (
        isNaN(numVal) ||
        (!isNaN(min) && numVal < min) ||
        (!isNaN(max) && numVal > max)
      ) {
        invalidFields.push(label);
        return;
      }
    }

    if (
      requiredField.id === 'date-birth' ||
      requiredField.name === 'birthDate'
    ) {
      let dateVal = requiredField.value;
      if (dateVal && dateVal.includes('/')) {
        const parts = dateVal.split('/');
        if (parts.length === 3) {
          dateVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      if (dateVal) {
        const dateObj = new Date(dateVal + 'T00:00:00');
        const year = dateObj.getFullYear();
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear) {
          invalidFields.push(label);
        }
      }
    }
  });

  return { isValid: invalidFields.length === 0, invalidFields };
}

export function setError(invalidFields) {
  invalidFields.forEach((field) => {
    field.classList.add('error');
  });
}

export function clearFieldError(input) {
  const label = input.parentElement;
  label.classList.remove('error');
}
