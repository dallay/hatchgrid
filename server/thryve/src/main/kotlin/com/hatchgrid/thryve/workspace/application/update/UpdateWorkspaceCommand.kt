package com.hatchgrid.thryve.workspace.application.update

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to update a workspace.
 * @property id The unique identifier of the workspace.
 * @property name The new name of the workspace.
 * @property description An optional description of the workspace.
 */
data class UpdateWorkspaceCommand(val id: String, val name: String, val description: String?) :
    Command
