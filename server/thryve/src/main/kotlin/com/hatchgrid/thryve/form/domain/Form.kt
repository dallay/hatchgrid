package com.hatchgrid.thryve.form.domain

import com.hatchgrid.common.domain.BaseEntity
import com.hatchgrid.thryve.form.domain.dto.FormStyleConfiguration
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import java.time.LocalDateTime
import java.util.UUID

/**
 * Data class representing a form.
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
 * @property createdAt The creation time of the form.
 * @property updatedAt The last update time of the form.
 */
data class Form(
    override val id: FormId,
    var name: String,
    var header: String,
    var description: String,
    var inputPlaceholder: String,
    var buttonText: String,
    var buttonColor: HexColor,
    var backgroundColor: HexColor,
    var textColor: HexColor,
    var buttonTextColor: HexColor,
    val workspaceId: WorkspaceId,
    override val createdAt: LocalDateTime = LocalDateTime.now(),
    override var updatedAt: LocalDateTime? = createdAt,
) : BaseEntity<FormId>() {

    /**
     * Updates the form with the given Style Configuration and records a FormUpdatedEvent.
     *
     * @param styleConfiguration The [FormStyleConfiguration] containing the new form data.
     */
    fun update(styleConfiguration: FormStyleConfiguration) {
        // Validate all color formats before processing
        styleConfiguration.validateColors()
        var modified = false

        if (name != styleConfiguration.name) {
            name = styleConfiguration.name
            modified = true
        }

        if (header != styleConfiguration.header) {
            header = styleConfiguration.header
            modified = true
        }

        if (description != styleConfiguration.description) {
            description = styleConfiguration.description
            modified = true
        }

        if (inputPlaceholder != styleConfiguration.inputPlaceholder) {
            inputPlaceholder = styleConfiguration.inputPlaceholder
            modified = true
        }

        if (buttonText != styleConfiguration.buttonText) {
            buttonText = styleConfiguration.buttonText
            modified = true
        }

        if (buttonColor.value != styleConfiguration.buttonColor) {
            buttonColor = HexColor(styleConfiguration.buttonColor)
            modified = true
        }

        if (backgroundColor.value != styleConfiguration.backgroundColor) {
            backgroundColor = HexColor(styleConfiguration.backgroundColor)
            modified = true
        }

        if (textColor.value != styleConfiguration.textColor) {
            textColor = HexColor(styleConfiguration.textColor)
            modified = true
        }

        if (buttonTextColor.value != styleConfiguration.buttonTextColor) {
            buttonTextColor = HexColor(styleConfiguration.buttonTextColor)
            modified = true
        }

        if (modified) {
            updatedAt = LocalDateTime.now()

            record(
                FormUpdatedEvent(
                    id.toString(),
                    name,
                    header,
                    description,
                    inputPlaceholder,
                    buttonText,
                    buttonColor.value,
                    backgroundColor.value,
                    textColor.value,
                    buttonTextColor.value,
                ),
            )
        }
    }

    companion object {
        /**
         * Creates a new form with the given id, Style Configuration, workspace id, and creation time.
         *
         * @param id The id of the new form.
         * @param styleConfiguration The [FormStyleConfiguration] containing the form data.
         * @param workspaceId The id of the workspace the form belongs to.
         * @param createdAt The creation time of the new form. Defaults to the current time.
         * @param updatedAt The last update time of the new form. Defaults to the creation time.
         * @return The newly created form.
         */
        fun create(
            id: UUID,
            styleConfiguration: FormStyleConfiguration,
            // Validate colors when creating a new form
            _ : Unit = styleConfiguration.validateColors(),
            workspaceId: UUID,
            createdAt: LocalDateTime = LocalDateTime.now(),
            updatedAt: LocalDateTime? = createdAt
        ): Form {
            val formId = FormId(id)
            val formWorkspaceId = WorkspaceId(workspaceId)
            val form = Form(
                id = formId,
                name = styleConfiguration.name,
                header = styleConfiguration.header,
                description = styleConfiguration.description,
                inputPlaceholder = styleConfiguration.inputPlaceholder,
                buttonText = styleConfiguration.buttonText,
                buttonColor = HexColor(styleConfiguration.buttonColor),
                backgroundColor = HexColor(styleConfiguration.backgroundColor),
                textColor = HexColor(styleConfiguration.textColor),
                buttonTextColor = HexColor(styleConfiguration.buttonTextColor),
                workspaceId = formWorkspaceId,
                createdAt = createdAt,
                updatedAt = updatedAt,
            )
            form.record(FormCreatedEvent(id.toString()))
            return form
        }
    }
}
