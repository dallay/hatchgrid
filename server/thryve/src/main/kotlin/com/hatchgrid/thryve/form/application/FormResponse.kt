package com.hatchgrid.thryve.form.application

import com.hatchgrid.common.domain.bus.query.Response
import com.hatchgrid.thryve.form.domain.Form

/**
 * Data class representing a response for a form.
 *
 * @property id The unique identifier of the form.
 * @property name The name of the form.
 * @property header The header of the form.
 * @property description The description of the form.
 * @property inputPlaceholder The input placeholder of the form.
 * @property buttonText The text of the button.
 * @property buttonColor The color of the button.
 * @property backgroundColor The background color of the form.
 * @property textColor The text color of the form.
 * @property buttonTextColor The text color of the button.
 * @property workspaceId The unique identifier of the workspace.
 * @property createdAt The creation time of the form.
 * @property updatedAt The last update time of the form.
 */
data class FormResponse(
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
    val createdAt: String? = null,
    val updatedAt: String? = null,
) : Response {
    companion object {
        /**
         * Creates a new FormResponse from a given Form.
         *
         * @param form The form to create the response from.
         * @return The newly created FormResponse.
         */
        fun from(form: Form) = FormResponse(
            id = form.id.value.toString(),
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.toString(),
            backgroundColor = form.backgroundColor.toString(),
            textColor = form.textColor.toString(),
            buttonTextColor = form.buttonTextColor.toString(),
            workspaceId = form.workspaceId.value.toString(),
            createdAt = form.createdAt.toString(),
            updatedAt = form.updatedAt?.toString(),
        )
    }
}
