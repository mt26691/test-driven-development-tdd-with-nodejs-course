import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
): void => {
  // TODO (chapter 18): map AppError subclasses to their status + { error,
  // message }, keep the schema-validation 400, and replace this pass-through
  // with a safe generic 500 that does not leak internals. For now we forward
  // the error to Fastify's default handling so the new tests fail honestly.
  reply.send(error);
};
