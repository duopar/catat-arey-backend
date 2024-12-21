const { createMockResponse, createMockNext } = require('../utils/jestMocks');

const {
  initializeSecrets,
  validateUserApiKey,
  validateUserAccessToken,
} = require('../../../middlewares/authMiddleware');

jest.mock('jsonwebtoken');
jest.mock('../../../config/secretManager', () => jest.fn());

const jwt = require('jsonwebtoken');
const getSecret = require('../../../config/secretManager');

let mockResponse;
let mockNext;

beforeEach(async () => {
  mockResponse = createMockResponse();
  mockNext = createMockNext();
});

describe('Validate API Key middleware', () => {
  beforeAll(async () => {
    getSecret.mockResolvedValue('valid-api-key');
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

  it('Allow request when API Key is valid.', async () => {
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

describe('Validate access token middleware', () => {
  beforeAll(async () => {
    getSecret.mockResolvedValue('Bearer valid-token');
    await initializeSecrets();
  });

  it('Reject request when access token is missing and return 401.', async () => {
    const mockRequest = {
      headers: {
        authorization: '',
      },
    };

    await validateUserAccessToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Access token is missing in the "authorization" header.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when access token format is invalid and return 401.', async () => {
    const mockRequests = [
      {
        headers: {
          authorization: 'invalid-token',
        },
      },
      {
        headers: {
          authorization: 'Bearer',
        },
      },
      {
        headers: {
          authorization: 'Bearer valid-token bar',
        },
      },
      {
        headers: {
          authorization: 'foo valid-token bar',
        },
      },
    ];

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      await validateUserAccessToken(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message:
          'Invalid access token format. Expected "Bearer <your-access-token>".',
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when access token has expired and return 401.', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer expired-token',
      },
    };

    jwt.verify.mockImplementationOnce(() => {
      const error = new Error('jwt has expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await validateUserAccessToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Access token has expired.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when access token is invalid and return 401.', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    jwt.verify.mockImplementationOnce(() => {
      const error = new Error('jwt is invalid');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    await validateUserAccessToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Access token is invalid.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when access token is valid.', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    await validateUserAccessToken(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
