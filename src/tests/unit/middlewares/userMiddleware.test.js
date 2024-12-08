const { createMockResponse, createMockNext } = require('../utils/jestMocks');

const {
  validateUserIdParam,
  validateUserUpdate,
} = require('../../../middlewares/userMiddleware');

jest.mock('bcrypt');
jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
}));

const bcrypt = require('bcrypt');
const db = require('../../../config/firestore');

let mockResponse;
let mockNext;

beforeEach(() => {
  mockResponse = createMockResponse();
  mockNext = createMockNext();
});

describe('Validate user id parameter middleware', () => {
  let mockRequest;

  beforeAll(() => {
    mockRequest = {
      params: {
        userId: 'my-userId',
      },
    };
  });

  it('Reject request when userId is not found and return 404.', async () => {
    db.get.mockResolvedValueOnce({
      exists: false,
    });

    await validateUserIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'No user found with the provided ID.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when userId exists.', async () => {
    db.get.mockResolvedValueOnce({
      exists: true,
    });

    await validateUserIdParam(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('Validate user update middleware', () => {
  it('Reject request when any property is empty and return 400.', async () => {
    const mockRequests = [
      {
        body: {
          newPassword: 'Tes@4321',
          confirmPassword: 'Tes@4321',
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          confirmPassword: 'Tes@4321',
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Tes@4321',
        },
      },
    ];

    const validProperties = [
      'currentPassword',
      'newPassword',
      'confirmPassword',
    ];

    let validPropertiesIndex = 0;

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      await validateUserUpdate(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: `"${validProperties[validPropertiesIndex++]}" is required`,
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when newPassword is not valid and return 400.', async () => {
    const mockRequests = [
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'abc123!@', // no capital letters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'ABC123!@', // no lowercase letters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Abcdef!@', // no numbers
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Abc12345', // no special characters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Abc1!', // less than 8 characters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Aabc123!@ThisIsTooLongForThePasswordCheck', // more than 30 characters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Abc123!?<>', // contains non-permitted characters
        },
      },
      {
        body: {
          currentPassword: 'Tes@1234',
          newPassword: 'Abc123!@#_', // contains non-permitted characters
        },
      },
    ];

    for (const mockRequest of mockRequests) {
      jest.clearAllMocks();

      await validateUserUpdate(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message:
          '"newPassword" must be between 8-30 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        data: null,
      });
      expect(mockNext).not.toHaveBeenCalled();
    }
  });

  it('Reject request when confirmPassword does not match newPassword and return 400.', async () => {
    const mockRequest = {
      body: {
        currentPassword: 'Tes@1234',
        newPassword: 'Tes@4321',
        confirmPassword: 'Tes@8765',
      },
    };

    await validateUserUpdate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: '"confirmPassword" must match "newPassword"',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when userId from path parameter does not match userId from authorization token and return 401.', async () => {
    const mockRequest = {
      params: {
        userId: 'someone-else-userId',
      },
      decodedUserToken: {
        userId: 'my-userId',
      },
      body: {
        currentPassword: 'Tes@1234',
        newPassword: 'Tes@4321',
        confirmPassword: 'Tes@4321',
      },
    };

    await validateUserUpdate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Cannot change password for another user.',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when currentPassword is invalid and return 401.', async () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      decodedUserToken: {
        userId: 'my-userId',
      },
      body: {
        currentPassword: 'invalidPassword@1234',
        newPassword: 'Tes@4321',
        confirmPassword: 'Tes@4321',
      },
    };

    db.get.mockResolvedValueOnce({
      data: () => ({
        password: 'validPassword@1234',
      }),
    });

    bcrypt.compare.mockResolvedValueOnce(false);

    await validateUserUpdate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Invalid "currentPassword".',
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Reject request when server encounters an error and return 500.', async () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      decodedUserToken: {
        userId: 'my-userId',
      },
      body: {
        currentPassword: 'Tes@1234',
        newPassword: 'Tes@4321',
        confirmPassword: 'Tes@4321',
      },
    };

    db.get.mockRejectedValueOnce(new Error('Database query failed.'));

    await validateUserUpdate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: expect.stringContaining(
        'Failed to update password due to server error.'
      ),
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('Allow request when all conditions are met', async () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      decodedUserToken: {
        userId: 'my-userId',
      },
      body: {
        currentPassword: 'Tes@1234',
        newPassword: 'Tes@4321',
        confirmPassword: 'Tes@4321',
      },
    };

    db.get.mockResolvedValueOnce({
      data: () => ({
        password: 'Tes@1234',
      }),
    });

    bcrypt.compare.mockResolvedValueOnce(true);

    await validateUserUpdate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });
});
