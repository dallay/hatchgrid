package com.hatchgrid.thryve.workspace.application.delete

import com.hatchgrid.common.domain.bus.command.Command
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

/**
 * Represents a command to delete a workspace.
 *
 * @property id Unique identifier for the workspace.
 */
data class DeleteWorkspaceCommand(
    @field:NotBlank(message = "Workspace ID cannot be blank")
    @field:Pattern(
        regexp = UUID_PATTERN,
        message = "Workspace ID must be a valid UUID",
    )
    val id: String
) : Command
