import { HttpMethod, HttpClient } from '../../infra/http/httpClient.js';

const client = HttpClient.create();

export async function sendFormData(data) {
  try {
    const response = await client.sendRequest({
      method: HttpMethod.POST,
      endpoint: '/candidatos',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
      errors: error.errorData.errors,
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
    const requiredField = label.querySelector('[required]');
    if (!requiredField) {
      return;
    }

    if (!fieldIsFilled(requiredField)) {
      invalidFields.push(label);
    }
  });

  return { isValid: invalidFields.length === 0, invalidFields };
}

export function handleFormErros(invalidFields) {
  invalidFields.forEach((field) => {
    field.classList.add('error');
  });
}

export function clearFieldError(input) {
  const label = input.parentElement;
  label.classList.remove('error');
}
