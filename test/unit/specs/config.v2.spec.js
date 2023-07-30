import {
    getConfigFromFile,
} from '@/config'
import fitch from 'fitch';

jest.mock('fitch');

describe('getConfigFromFile', () => {
  test('retorna a configuração correta', async () => {
    const mockResponse = {
      data: {
        dashboard: {
          config: {
            gitlab: 'gitlab.example.com',
            token: '123456',
            gitlabciProtocol: 'https',
            hideSuccessCards: false,
            hideVersion: false,
            interval: 60,
            apiVersion: 3,
          },
          projects: [
            {
              description: 'React Native render for draft.js model',
              namespace: 'globocom',
              project: 'react-native-draftjs-render',
              branch: 'master',
            },
          ],
        },
      },
    };

    fitch.get.mockResolvedValue(mockResponse);

    const result = await getConfigFromFile('https://example.com/config.json');

    expect(result).toEqual(mockResponse.data.dashboard);
  });

  test('retorna um erro se a URL do arquivo de configuração não for fornecida', async () => {
    await expect(getConfigFromFile(null)).rejects.toThrow('Needs to pass a config file url');
  });

  test('retorna um erro se o arquivo de configuração for inválido', async () => {
    const mockResponse = {
      data: {
        invalid: true,
      },
    };

    fitch.get.mockResolvedValue(mockResponse);

    await expect(getConfigFromFile('https://example.com/config.json')).rejects.toThrow('Invalid file');
  });
});