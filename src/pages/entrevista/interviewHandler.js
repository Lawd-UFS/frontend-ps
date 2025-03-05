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

export const fetchInterviewStatus = async () => {
  const response = await interviewService.getInterview(candidateId);

  if (!response.success) {
    return null;
  }

  return response.data.status;
};

export const getInterviewAnswers = (questionsContainer, questions) => {
  const uiQuestions = Array.from(
    questionsContainer.querySelectorAll('.question'),
  );

  const answers = questions.map((question, index) => {
    const uiQuestion = uiQuestions.find(
      (uiQuestion) => uiQuestion.dataset.id === index.toString(),
    );

    const score = uiQuestion.querySelector('.scores [active]');

    if (!score) {
      throw new Error(`Questão número ${index + 1} não possui nota`);
    }

    const notes = uiQuestion.querySelector('.notes textarea').value || null;

    return {
      ...question,
      score: score.textContent,
      notes,
    };
  });

  return answers;
};

