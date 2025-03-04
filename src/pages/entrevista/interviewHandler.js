import { InterviewService } from '../../service/InterviewService';
import { HttpClient } from '../../infra/http/httpClient';
import { authenticationService } from '../../service/AuthenticationService';
import { stateService } from '../../service/StateService';

const interviewService = new InterviewService(
  HttpClient.create(),
  authenticationService.getToken(),
  stateService,
);

const url = window.location.pathname;
const candidateId = url === '/entrevista' ? null : url.split('/').pop();

export const fetchQuestions = async () => {
  const response = await interviewService.getInterview(candidateId);

  if (!response.success) {
    return [];
  }

  return response.data.questions;
};

export const fetchInterviewCandidate = async () => {
  const response = await interviewService.getInterview(candidateId);

  if (!response.success) {
    return null;
  }

  return response.data.candidate;
};

export const fetchInterviewEvaluator = async () => {
  const response = await interviewService.getInterview(candidateId);

  if (!response.success) {
    return null;
  }

  return response.data.evaluator;
};

export const fetchInterviewDate = async () => {
  const response = await interviewService.getInterview(candidateId);

  if (!response.success) {
    return null;
  }

  return new Date(response.data.date);
};
