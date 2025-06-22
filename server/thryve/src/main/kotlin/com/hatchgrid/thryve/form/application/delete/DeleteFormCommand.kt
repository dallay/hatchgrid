package com.hatchgrid.thryve.form.application.delete

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to delete a form.
 *
 * @property workspaceId Unique identifier for the workspace.
 * @property formId Unique identifier for the form.
 * @property userId Unique identifier of the user who is authorized to delete the form.
 */
data class DeleteFormCommand(
    val workspaceId: String,
    val formId: String,
    val userId: String,
) : Command
