package com.hatchgrid.common.domain.bus

import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.common.domain.bus.command.CommandWithResult
import com.hatchgrid.common.domain.bus.notification.Notification
import com.hatchgrid.common.domain.bus.pipeline.PipelineBehavior
import com.hatchgrid.common.domain.bus.query.Query

class MediatorImpl(
    private val registry: Registry,
    private val defaultPublishStrategy: PublishStrategy = StopOnExceptionPublishStrategy(),
) : Mediator {

    override suspend fun <TQuery : Query<TResponse>, TResponse> send(query: TQuery): TResponse =
        processPipeline(
            registry.getPipelineBehaviors(),
            query,
        ) {
            registry.resolveQueryHandler(query.javaClass).handle(query)
        }

    override suspend fun <TCommand : Command> send(command: TCommand) = processPipeline(
        registry.getPipelineBehaviors(),
        command,
    ) {
        registry.resolveCommandHandler(command.javaClass).handle(command)
    }

    override suspend fun <TCommand : CommandWithResult<TResult>, TResult> send(command: TCommand): TResult =
        processPipeline(
            registry.getPipelineBehaviors(),
            command,
        ) {
            registry.resolveCommandWithResultHandler(command.javaClass).handle(command)
        }

    override suspend fun <T : Notification> publish(notification: T) =
        publish(notification, defaultPublishStrategy)

    override suspend fun <T : Notification> publish(
        notification: T,
        publishStrategy: PublishStrategy,
    ) = processPipeline(
        registry.getPipelineBehaviors(),
        notification,
    ) {
        publishStrategy.publish(
            notification,
            registry.resolveNotificationHandlers(notification.javaClass),
        )
    }

    private suspend fun <TRequest, TResponse> processPipeline(
        pipelineBehaviors: Collection<PipelineBehavior>,
        request: TRequest,
        handler: RequestHandlerDelegate<TRequest, TResponse>,
    ): TResponse = pipelineBehaviors
        .reversed()
        .fold(handler) { next, pipeline ->
            {
                pipeline.handle(request) { next(it) }
            }
        }(request)
}
