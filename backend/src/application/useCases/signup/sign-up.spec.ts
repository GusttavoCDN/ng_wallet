import { ConflictError } from '../../../errors';
import {
  AddUserRepository,
  FindUserRepository,
  PasswordEncrypter
} from '../../contracts';
import { SignupUseCase } from './sign-up';

interface SutTypes {
  sut: SignupUseCase
  usersRepositoryStub: jest.Mocked<AddUserRepository & FindUserRepository>
  passwordEncrypterStub: jest.Mocked<PasswordEncrypter>
}

const fakeUser = {
  id: 1,
  username: 'any_username',
  password: 'any_password',
  accountId: 'any_account_id'
};

const fakeRequest = {
  username: 'any_username',
  password: 'any_password'
};

const makeSut = (): SutTypes => {
  const usersRepositoryStub: jest.Mocked<AddUserRepository & FindUserRepository> = {
    create: jest.fn().mockResolvedValue(fakeUser),
    findByUsername: jest.fn().mockResolvedValue(null)
  };

  const passwordEncrypterStub: jest.Mocked<PasswordEncrypter> = {
    encrypt: jest.fn().mockResolvedValue('hashed_password')
  };

  const sut = new SignupUseCase(usersRepositoryStub, passwordEncrypterStub);
  return { sut, usersRepositoryStub, passwordEncrypterStub };
};

describe('CreateUser use case Test', () => {
  it('Should call find with the correct value ', async () => {
    const { sut, usersRepositoryStub } = makeSut();
    const findSpy = jest.spyOn(usersRepositoryStub, 'findByUsername');

    await sut.execute(fakeRequest);

    expect(findSpy).toHaveBeenCalledWith(fakeRequest.username);
  });

  it('Should throw an error if user already exists', async () => {
    const { sut, usersRepositoryStub } = makeSut();
    usersRepositoryStub.findByUsername.mockResolvedValueOnce(fakeUser);

    const promise = sut.execute(fakeRequest);

    await expect(promise).rejects.toThrow(ConflictError);
  });

  it('Should call encrypt with the correct value ', async () => {
    const { sut, passwordEncrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(passwordEncrypterStub, 'encrypt');

    await sut.execute(fakeRequest);

    expect(encryptSpy).toHaveBeenCalledWith(fakeRequest.password);
  });

  it('Should call add with the correct values ', async () => {
    const { sut, usersRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(usersRepositoryStub, 'create');

    await sut.execute(fakeRequest);

    expect(addSpy).toHaveBeenCalledWith({
      username: fakeRequest.username,
      password: 'hashed_password'
    });
  });

  it('Should return the created user', async () => {
    const { sut } = makeSut();

    const user = await sut.execute(fakeRequest);

    expect(user).toEqual({
      id: 1,
      username: fakeRequest.username,
      account: 'any_account_id'
    });
  });
});
