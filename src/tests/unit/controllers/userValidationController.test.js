const {
  register,
  login,
} = require('../../../controllers/userValidationController');

const { createMockResponse } = require('../utils/jestMocks');

jest.mock('jsonwebtoken');
jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  add: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const db = require('../../../config/firestore');

let mockResponse;

beforeEach(() => {
  mockResponse = createMockResponse();
});

describe('Validate register controller', () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      body: {
        username: 'testUser',
        password: 'Tes@1234',
        role: 'owner',
      },
    };
  });

  it('Fail to register user when server encounters an error and return 500.', async () => {
    db.add.mockRejectedValueOnce(new Error('Database query failed.'));

    await register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Registration failed due to server error.',
      data: null,
    });
  });

  it('Successfully register user with valid data and return 201.', async () => {
    db.add.mockResolvedValueOnce({
      id: 'my-userId',
    });

    await register(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Registration successful.',
      data: {
        userId: 'my-userId',
      },
    });
  });
});

describe('Validate login controller', () => {
  it('Successfully log in user with valid data and return 200.', async () => {
    const mockRequest = {
      userData: {
        userId: 'my-userId',
        username: 'testUser',
        role: 'owner',
      },
    };

    jwt.sign.mockReturnValue('my-token');

    await login(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Login successful.',
      data: {
        userId: 'my-userId',
        username: 'testUser',
        token: 'my-token',
      },
    });
  });
});
