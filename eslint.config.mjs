import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url); // Obtém o caminho do arquivo atual
const __dirname = path.dirname(__filename); // Obtém o diretório do arquivo atual
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all, // Define todas as configurações do módulo '@eslint/js'
});

export default [
  ...compat.extends('eslint:recommended'), // Estende a configuração 'eslint:recommended' com as configurações adicionais
  {
    files: ['*.config.{js,cjs}'], // Aplica as regras a arquivos com extensão '.config.js' ou '.config.cjs'
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'commonjs',
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['src/**/*.js'], // Aplica as regras a arquivos com extensão '.js' dentro do diretório 'src' e seus subdiretórios
    languageOptions: {
      globals: {
        ...globals.browser, // Define as variáveis globais específicas do navegador
        process: 'readonly', // Define a variável 'process' como somente leitura
      },
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'], // Define a regra 'semi' como erro e exige ponto e vírgula em todas as linhas
      quotes: ['error', 'single'], // Define a regra 'quotes' como erro e exige aspas simples para strings
      indent: ['error', 2], // Define a regra 'indent' como erro e exige uma indentação de 2 espaços
      'no-unused-vars': ['warn'], // Define a regra 'no-unused-vars' como aviso
      'no-console': ['warn'], // Desativa a regra 'no-console'
      curly: ['error', 'all'], // Define a regra 'curly' como erro e exige chaves em todas as estruturas de controle

      'no-multiple-empty-lines': [
        'error',
        {
          max: 1, // Define o número máximo de linhas vazias consecutivas como 1
        },
      ],
    },
  },
];
