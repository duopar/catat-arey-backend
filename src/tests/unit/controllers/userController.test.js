const {
  getUserById,
  updateUser,
} = require('../../../controllers/userController');

const { createMockResponse } = require('../utils/jestMocks');

jest.mock('bcrypt');
jest.mock('../../../config/firestore', () => ({
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  update: jest.fn(),
}));

const db = require('../../../config/firestore');

let mockResponse;

beforeEach(() => {
  mockResponse = createMockResponse();
});

describe('Validate getUserById controller', () => {
  it('Successfully retrieve user data and return 200.', () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      userData: {
        username: 'testUser',
        role: 'my-role',
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
    };

    getUserById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'User data retrieved successfully.',
      data: {
        userId: 'my-userId',
        username: 'testUser',
        role: 'my-role',
        createdAt: 'some-date',
        updatedAt: 'some-date',
      },
    });
  });
});

describe('Validate updateUser controller', () => {
  it('Fail to update user password when server encounters an error and return 500.', async () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      body: {
        newPassword: 'Tes@1234',
      },
    };

    db.update.mockRejectedValueOnce(new Error('Database query failed.'));

    await updateUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to update password due to server error.',
      data: null,
    });
  });

  it('Successfully update user password and return 200.', async () => {
    const mockRequest = {
      params: {
        userId: 'my-userId',
      },
      body: {
        newPassword: 'Tes@1234',
      },
    };

    await updateUser(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: 'success',
      message: 'Password updated successfully.',
      data: null,
    });
  });
});
