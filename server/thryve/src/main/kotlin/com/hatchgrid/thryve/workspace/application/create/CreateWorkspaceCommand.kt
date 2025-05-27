package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to create a workspace.
 *
 * @property id Unique identifier for the workspace.
 * @property name Name of the workspace.
 * @property description Optional description of the workspace.
 * @property ownerId Unique identifier of the owner of the workspace.
 */
data class CreateWorkspaceCommand(
    val id: String,
    val name: String,
    val description: String? = null,
    val ownerId: String,
) : Command
