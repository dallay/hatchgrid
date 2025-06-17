package com.hatchgrid.thryve.newsletter.tag.application.delete

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.command.CommandHandler
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * Command handler for deleting a tag.
 *
 * @property workspaceAuthorizationService The service for checking workspace access permissions.
 * @property tagDestroyer The service responsible for deleting tags.
 */
@Service
class DeleteTagCommandHandler(
    private val workspaceAuthorizationService: WorkspaceAuthorizationService,
    private val tagDestroyer: TagDestroyer
) :
    CommandHandler<DeleteTagCommand> {

    /**
     * Handles the delete tag command.
     *
     * @param command The command containing the workspace ID and tag ID.
     */
    override suspend fun handle(command: DeleteTagCommand) {
        val workspaceId = WorkspaceId(command.workspaceId)
        val tagId = TagId(command.tagId)
        log.debug(
            "Deleting tag with tagId {} for workspace {}",
            tagId.value,
            workspaceId.value,
        )

        workspaceAuthorizationService.ensureAccess(command.workspaceId, command.userId)
        tagDestroyer.delete(workspaceId, tagId)
    }

    companion object {
        private val log = LoggerFactory.getLogger(DeleteTagCommandHandler::class.java)
    }
}
