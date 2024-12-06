const { createMockResponse, createMockNext } = require('../utils/jestMocks');

const {
  initializeSecrets,
  validateUserApiKey,
  validateUserToken,
} = require('../../../middlewares/authMiddleware');

jest.mock('../../../config/secretManager', () => jest.fn());

const getSecret = require('../../../config/secretManager');

describe('Validate API Key middleware', () => {
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockResponse = createMockResponse();
    mockNext = createMockNext();
  });

  beforeAll(async () => {
    getSecret.mockResolvedValueOnce('valid-api-key');
    await initializeSecrets();
  });

  it('Reject request when API Key is missing and return 401.', async () => {
    const mockRequest = {
      headers: {
        'x-api-key': '',
      },
    };

    await validateUserApiKey(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'API key is missing in the "x-api-key" header.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when API Key is invalid and return 401.', async () => {
    const mockRequest = {
      headers: {
        'x-api-key': 'invalid-api-key',
      },
    };

    await validateUserApiKey(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid API key.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when API Key is valid and return 200.', async () => {
    const mockRequest = {
      headers: {
        'x-api-key': 'valid-api-key',
      },
    };

    await validateUserApiKey(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
