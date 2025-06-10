package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.common.domain.bus.command.Command
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

/**
 * Represents a command to create a workspace.
 *
 * @property id Unique identifier for the workspace.
 * @property name Name of the workspace.
 * @property description Optional description of the workspace.
 * @property ownerId Unique identifier of the owner of the workspace.
 */
data class CreateWorkspaceCommand(
    @field:NotBlank(message = "Workspace ID cannot be blank")
    @field:Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = "Workspace ID must be a valid UUID",
    )
    val id: String,
    @field:NotBlank(message = "Workspace name cannot be blank")
    val name: String,
    val description: String? = null,
    @field:NotBlank(message = "Owner ID cannot be blank")
    @field:Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = "Owner ID must be a valid UUID",
    )
    val ownerId: String,
) : Command
