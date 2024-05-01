import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController, HttpError, HttpMethod, ValidateDtoMiddleware } from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { fillDTO } from '../../helpers/index.js';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes.js';
import { CreateUserRequest } from './types/create-user-request.type.js';
import { UserService } from './user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { CreateUserRdo } from './rdo/create-user.rdo.js';
import { LoginUserRequest } from './types/login-user-request.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
  ) {
    super(logger);

    this.logger.info('Register routes for UserController…');

    // POST /register
    this.addRoute({ path: '/register', method: HttpMethod.Post, handler: this.register,
      middlewares: [
        new ValidateDtoMiddleware(CreateUserDto),
      ] });
    // POST /login
    this.addRoute({ path: '/login', method: HttpMethod.Post, handler: this.auth,
      middlewares: [
        new ValidateDtoMiddleware(LoginUserDto),
      ]
    });
    // GET /login
    this.addRoute({ path: '/login', method: HttpMethod.Get, handler: this.checkAuth });
    // DELETE /logout
    this.addRoute({ path: '/logout', method: HttpMethod.Delete, handler: this.logout });
  }

  public async register(
    { body }: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(CreateUserRdo, result));
  }

  public async auth({ body }: LoginUserRequest,
    _res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (! existsUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        `User with email ${body.email} not found.`,
        'UserController',
      );
    }

    throw new HttpError(
      StatusCodes.NOT_IMPLEMENTED,
      'Not implemented',
      'UserController',
    );
  }

  public checkAuth(req: Request, res: Response): void {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'not implemented', 'UserController');
  }

  public logout(req: Request, res: Response): void {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'not implemented', 'UserController');
  }
}