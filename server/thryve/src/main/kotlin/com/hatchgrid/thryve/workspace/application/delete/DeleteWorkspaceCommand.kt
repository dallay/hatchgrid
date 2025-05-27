package com.hatchgrid.thryve.workspace.application.delete

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to delete a workspace.
 *
 * @property id Unique identifier for the workspace.
 */
data class DeleteWorkspaceCommand(
    val id: String
) : Command
