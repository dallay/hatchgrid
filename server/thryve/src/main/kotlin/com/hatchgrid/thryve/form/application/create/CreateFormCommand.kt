package com.hatchgrid.thryve.form.application.create

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Represents a command to create a form.
 *
 * @property id Unique identifier for the form.
 * @property name Name of the form.
 * @property header Header text for the form.
 * @property description Description of the form.
 * @property inputPlaceholder Placeholder text for the form input field.
 * @property buttonText Text for the form submission button.
 * @property buttonColor Color for the form submission button.
 * @property backgroundColor Background color for the form.
 * @property textColor Text color for the form.
 * @property buttonTextColor Text color for the form submission button.
 * @property workspaceId Unique identifier for the workspace that owns the form.
 * @property userId Unique identifier that is member of the workspace, used for authorization.
 */
data class CreateFormCommand(
    val id: String,
    val name: String,
    val header: String,
    val description: String,
    val inputPlaceholder: String,
    val buttonText: String,
    val buttonColor: String,
    val backgroundColor: String,
    val textColor: String,
    val buttonTextColor: String,
    val workspaceId: String,
    val userId: String,
) : Command
