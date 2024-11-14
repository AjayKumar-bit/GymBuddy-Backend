export const ApiStatusCode = {
  BadRequest: 400,
  Created: 201,
  DuplicateEntries: 409,
  Forbidden: 403,
  MethodNotFound: 405,
  NetworkError: 'ERR_NETWORK',
  NoContent: 204,
  NotFound: 404,
  ServerError: 500,
  Success: 200,
  Unauthorized: 401,
}

export const ApiErrorMessages = {
  ErrorWhileCreatingUser: 'Something went wrong while creating app',
  IncorrectPassword: 'Password is incorrect',
  InvalidData: 'Name and Email is missing',
  InvalidEmail: 'Email id is invalid ',
  InvalidLoginCred: 'Login credentials are invalid please check',
  InvalidToken: 'Invalid Token',
  NotAValidUser: 'Not a valid user',
  RequiredFieldMissing: 'Not all required field filled',
  SomethingWentWrong: 'Something went wrong ,please try again later',
  UserAlreadyRegistered: 'User is already registered with this email id',
  UserNotFound: 'No user Found with this email id .please register first',
}

export const ApiSuccessMessages = {
  LoggedOutSuccessfully: 'Logged out successfully',
  LoginSuccessfully: 'Logged in successfully ',
  ProfileUpdated: 'Profile updated successfully',
  UserCreatedSuccessfully: 'User Created Successfully',
  UserDeleted: 'User deleted successfully',
  VerificationCodeSent: 'Verification code have been sent to email ',
}
