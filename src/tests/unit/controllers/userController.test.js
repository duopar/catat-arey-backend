const {
  getUserById,
  updateUser,
} = require('../../../controllers/userController');

const { createMockResponse } = require('../utils/jestMocks');

jest.mock('../../../config/firestore', () => ({
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
