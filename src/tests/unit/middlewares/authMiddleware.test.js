const { createMockResponse, createMockNext } = require('../utils/jestMocks');

const {
  initializeSecrets,
  validateUserApiKey,
  validateUserAccessOrRefreshToken,
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

describe('Validate access or refresh token middleware', () => {
  beforeAll(async () => {
    getSecret.mockResolvedValue('Bearer valid-token');
    await initializeSecrets();
  });

  it('Reject request when access or refresh token is missing and return 401.', async () => {
    const mockRequests = [
      {
        path: '',
        headers: {
          authorization: '',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: '',
        },
      },
    ];

    const tokenTypes = ['Access', 'Refresh'];

    for (let i = 0; i < mockRequests.length; i++) {
      jest.clearAllMocks();

      await validateUserAccessOrRefreshToken(
        mockRequests[i],
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `${tokenTypes[i]} token is missing in the "authorization" header.`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when access or refresh token format is invalid and return 401.', async () => {
    const mockRequests = [
      {
        path: '',
        headers: {
          authorization: 'invalid-token',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'invalid-token',
        },
      },
      {
        path: '',
        headers: {
          authorization: 'Bearer',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'Bearer',
        },
      },
      {
        path: '',
        headers: {
          authorization: 'Bearer valid-token bar',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'Bearer valid-token bar',
        },
      },
      {
        path: '',
        headers: {
          authorization: 'foo valid-token bar',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'foo valid-token bar',
        },
      },
    ];

    const tokenTypes = ['access', 'refresh'];

    for (let i = 0; i < mockRequests.length; i++) {
      jest.clearAllMocks();

      await validateUserAccessOrRefreshToken(
        mockRequests[i],
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `Invalid ${tokenTypes[i % 2]} token format. Expected "Bearer <your-${tokenTypes[i % 2]}-token>".`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when access or refresh token has expired and return 401.', async () => {
    const mockRequests = [
      {
        path: '',
        headers: {
          authorization: 'Bearer expired-token',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'Bearer expired-token',
        },
      },
    ];

    const tokenTypes = ['Access', 'Refresh'];

    for (let i = 0; i < mockRequests.length; i++) {
      jest.clearAllMocks();

      jwt.verify.mockImplementationOnce(() => {
        const error = new Error('jwt has expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await validateUserAccessOrRefreshToken(
        mockRequests[i],
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `${tokenTypes[i]} token has expired.`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when access or refresh token is invalid and return 401.', async () => {
    const mockRequests = [
      {
        path: '',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      },
    ];

    const tokenTypes = ['Access', 'Refresh'];

    for (let i = 0; i < mockRequests.length; i++) {
      jest.clearAllMocks();

      jwt.verify.mockImplementationOnce(() => {
        const error = new Error('jwt is invalid');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await validateUserAccessOrRefreshToken(
        mockRequests[i],
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `${tokenTypes[i]} token is invalid.`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Allow request when access or refresh token is valid.', async () => {
    const mockRequests = [
      {
        path: '',
        headers: {
          authorization: 'Bearer valid-token',
        },
      },
      {
        path: '/refresh',
        headers: {
          authorization: 'Bearer valid-token',
        },
      },
    ];

    for (let i = 0; i < mockRequests.length; i++) {
      jest.clearAllMocks();

      await validateUserAccessOrRefreshToken(
        mockRequests[i],
        mockResponse,
        mockNext
      );

      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    }
  });
});
