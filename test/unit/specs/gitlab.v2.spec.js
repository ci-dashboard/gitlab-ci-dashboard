import {
  setBaseData,
  getBaseData,
  getProjects,
  getBranch,
  getBranches
} from '@/gitlab'
import fitch from 'fitch';

jest.mock('fitch');

describe('gitlab', () => {
  const baseData = {
    gitlab: 'gitlab.example.com',
    token: '123456',
    gitlabciProtocol: 'https',
  };

  beforeEach(() => {
    setBaseData(baseData);
  });

  test('setBaseData define os dados base corretamente', () => {
    const newData = {
      gitlab: 'gitlab.example.com',
      token: '654321',
      gitlabciProtocol: 'http',
    };

    setBaseData(newData.gitlab, newData.token, newData.gitlabciProtocol);
    const baseData = getBaseData()
    expect(baseData.baseUrl).toEqual('http://gitlab.example.com/api/v3')
    expect(baseData.token).toEqual('654321')
  });

  test('getProjects retorna a lista de projetos correta', async () => {
    const mockResponse = [
      {
        id: 1,
        name: 'Projeto 1',
      },
      {
        id: 2,
        name: 'Projeto 2',
      },
    ];

    fitch.get.mockResolvedValue(mockResponse);

    const result = await getProjects("namespace/project");

    expect(result).toEqual(mockResponse);
  });

  test('getBranch retorna a branch correta', async () => {
    const mockResponse = {
      name: 'master',
    };

    fitch.get.mockResolvedValue(mockResponse);

    const result = await getBranch('projeto', 'master');

    expect(result).toEqual(mockResponse);
  });

    test('getBranches retorna a lista de branches correta', async () => {
        const mockResponse = [
        {
            projectId: "0",
            branchName: 'master',
        },
        {
            projectId: "1",
            branchName: 'develop',
        },
        ];
        fitch.get.mockResolvedValue(mockResponse);

        const result = await getBranches([
            {
                projectId: "0",
                branchName: 'master',
            },
            {
                projectId: "1",
                branchName: 'develop',
            }
        ]);

        expect(result).toEqual(mockResponse);
    });
});