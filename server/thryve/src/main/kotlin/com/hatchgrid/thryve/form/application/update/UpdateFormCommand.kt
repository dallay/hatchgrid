package com.hatchgrid.thryve.form.application.update

import com.hatchgrid.common.domain.bus.command.Command

/**
 * Command to update a form.
 *
 * @property id The unique identifier of the form.
 * @property name The name of the form.
 * @property header The header text of the form.
 * @property description The description of the form.
 * @property inputPlaceholder The placeholder text for the input field.
 * @property buttonText The text displayed on the button.
 * @property buttonColor The color of the button.
 * @property backgroundColor The background color of the form.
 * @property textColor The color of the text in the form.
 * @property buttonTextColor The color of the text on the button.
 * @property workspaceId The unique identifier of the workspace associated with the form.
 * @property userId The unique identifier of the user making the update, used for authorization.
 */
data class UpdateFormCommand(
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
    val userId: String
) : Command
