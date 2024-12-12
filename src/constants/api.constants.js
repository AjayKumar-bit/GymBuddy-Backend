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
  DayNameMissing: 'Day Name is required.',
  DayAlreadyExist: 'This day already exist,please check',
  NoDaysFound: 'No days in planner found',
  DayIdMissing: 'Day id is missing',
  DayNameMissing: 'Day name is missing',
  DayAlreadyExist: 'Day already exist',
  FailedToUpdateDay: 'Failed to update day, try again later',
  NoDayFound: 'No day found in planner with this name and id',
  MissingExerciseData: 'Missing exercise and day to be added',
  ExerciseAlreadyExist: 'This exercise already exists in planner for',
  NoExerciseFound: 'No exercise found with this name',
  InvalidDaySelect: 'One of selected day is invalid',
  UnauthorizedAccess: 'Unauthorized,Please login in again',
  PlannerDateMissing: 'No PlannerDate added ,add planner start date first',
  AddDayFirst: 'No day found in planner, add day first',
  StartDateInFuture: 'Planner will start soon',
  NoDaysFound: 'No day found in planner',
  NoExerciseFound: 'No exercise found in planner for today',
}

export const ApiSuccessMessages = {
  LoggedOutSuccessfully: 'Logged out successfully',
  LoginSuccessfully: 'Logged in successfully',
  ProfileUpdated: 'Profile updated successfully',
  UserCreatedSuccessfully: 'User created Successfully',
  UserDeleted: 'User deleted successfully',
  VerificationCodeSent: 'Verification code have been sent to email',
  DayAdded: 'Day added successfully',
  DayDeleted: 'Day deleted successfully',
  DayUpdated: 'Day updated successfully',
  ExerciseAdded: 'Exercise(s) added successfully',
  NoExerciseFound: 'No exercise data available for this day',
  ExerciseDeleted: 'Exercise deleted successfully',
  ExerciseUpdated: 'Exercise updated successfully',
  PlannerDateAdded: 'Date added',
}
