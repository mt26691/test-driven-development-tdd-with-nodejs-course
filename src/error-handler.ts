import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./errors";

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error instanceof AppError) {
    reply.code(error.statusCode).send({
      error: error.error,
      message: error.message,
    });
    return;
  }

  if (error.validation) {
    reply.code(400).send({
      error: "Bad Request",
      message: error.message,
    });
    return;
  }

  request.log.error(error);
  reply.code(500).send({
    error: "Internal Server Error",
    message: "An unexpected error occurred.",
  });
};
