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

interface Registry {

    fun <TCommand : Command> resolveCommandHandler(classOfCommand: Class<TCommand>): CommandHandler<TCommand>

    fun <TCommand : CommandWithResult<TResult>, TResult> resolveCommandWithResultHandler(
        classOfCommand: Class<TCommand>,
    ): CommandWithResultHandler<TCommand, TResult>

    fun <TQuery : Query<TResult>, TResult> resolveQueryHandler(
        classOfQuery: Class<TQuery>,
    ): QueryHandler<TQuery, TResult>

    fun <TNotification : Notification> resolveNotificationHandlers(
        classOfNotification: Class<TNotification>,
    ): Collection<NotificationHandler<TNotification>>

    fun getPipelineBehaviors(): Collection<PipelineBehavior>
}
