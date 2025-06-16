package com.hatchgrid.thryve.newsletter.tag.application.update

import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import java.util.UUID
import org.slf4j.LoggerFactory

/**
 *
 * @created 22/9/24
 */
@Service
class UpdateTagCommandHandler(private val tagUpdater: TagUpdater) : CommandHandler<UpdateTagCommand> {
    override suspend fun handle(command: UpdateTagCommand) {
        log.debug(
            "Updating tag with id {} and name {} for workspace {}",
            command.id,
            command.name,
            command.workspaceId,
        )
        val tagId = UUID.fromString(command.id)
        val color = command.color?.let { TagColor.fromString(it) }
        val workspaceId = UUID.fromString(command.workspaceId)
        tagUpdater.update(tagId, command.name, color, workspaceId, command.subscribers)
    }

    companion object {
        private val log = LoggerFactory.getLogger(UpdateTagCommandHandler::class.java)
    }
}
