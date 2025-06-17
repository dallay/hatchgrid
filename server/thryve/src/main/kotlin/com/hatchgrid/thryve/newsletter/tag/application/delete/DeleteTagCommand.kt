package com.hatchgrid.thryve.newsletter.tag.application.delete

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Command class for deleting a tag.
 *
 * @property workspaceId The ID of the workspace to which the tag belongs.
 * @property userId The ID of the user requesting the deletion of the tag.
 * @property tagId The ID of the tag to be deleted.
 */
data class DeleteTagCommand(
    val workspaceId: String,
    val userId: String,
    val tagId: String
) : Command
