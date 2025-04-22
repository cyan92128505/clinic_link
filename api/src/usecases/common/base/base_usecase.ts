/**
 * Base use case interface that all use cases should implement
 */
export interface IUseCase<IRequest, IResponse> {
  execute(request?: IRequest): Promise<IResponse>;
}

/**
 * Base command use case for operations that change state
 */
export abstract class BaseCommandUseCase<IRequest, IResponse>
  implements IUseCase<IRequest, IResponse>
{
  abstract execute(request?: IRequest): Promise<IResponse>;
}

/**
 * Base query use case for operations that read state
 */
export abstract class BaseQueryUseCase<IRequest, IResponse>
  implements IUseCase<IRequest, IResponse>
{
  abstract execute(request?: IRequest): Promise<IResponse>;
}
