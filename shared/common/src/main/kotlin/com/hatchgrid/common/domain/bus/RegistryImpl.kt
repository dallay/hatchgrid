@file:Suppress("UNCHECKED_CAST")

package com.hatchgrid.common.domain.bus

import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.common.domain.bus.command.CommandWithResult
import com.hatchgrid.common.domain.bus.command.CommandWithResultHandler
import com.hatchgrid.common.domain.bus.notification.Notification
import com.hatchgrid.common.domain.bus.notification.NotificationHandler
import com.hatchgrid.common.domain.bus.pipeline.PipelineBehavior
import com.hatchgrid.common.domain.bus.query.Query
import com.hatchgrid.common.domain.bus.query.QueryHandler

class RegistryImpl(
    dependencyProvider: DependencyProvider,
) : Registry {

    private val registry = Container(dependencyProvider)

    override fun <TCommand : Command> resolveCommandHandler(
        classOfCommand: Class<TCommand>,
    ): CommandHandler<TCommand> {
        val handler = registry.commandMap[classOfCommand]?.get()
            ?: throw HandlerNotFoundException("handler could not be found for ${classOfCommand.name}")
        return handler as CommandHandler<TCommand>
    }

    override fun <TCommand : CommandWithResult<TResult>, TResult> resolveCommandWithResultHandler(
        classOfCommand: Class<TCommand>,
    ): CommandWithResultHandler<TCommand, TResult> {
        val handler = registry.commandWithResultMap[classOfCommand]?.get()
            ?: throw HandlerNotFoundException("handler could not be found for ${classOfCommand.name}")
        return handler as CommandWithResultHandler<TCommand, TResult>
    }

    override fun <TNotification : Notification> resolveNotificationHandlers(
        classOfNotification: Class<TNotification>,
    ): Collection<NotificationHandler<TNotification>> =
        registry.notificationMap.filter { (k, _) -> k.isAssignableFrom(classOfNotification) }
            .flatMap { (_, v) -> v.map { it.get() as NotificationHandler<TNotification> } }

    override fun <TQuery : Query<TResult>, TResult> resolveQueryHandler(
        classOfQuery: Class<TQuery>,
    ): QueryHandler<TQuery, TResult> {
        val handler = registry.queryMap[classOfQuery]?.get()
            ?: throw HandlerNotFoundException("handler could not be found for ${classOfQuery.name}")
        return handler as QueryHandler<TQuery, TResult>
    }

    override fun getPipelineBehaviors(): Collection<PipelineBehavior> =
        registry.pipelineSet.map { it.get() }
}
