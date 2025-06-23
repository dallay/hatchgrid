package com.hatchgrid.thryve.form.domain

import com.hatchgrid.common.domain.BaseEntity
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import java.time.LocalDateTime
import java.util.*

/**
 * Represents a Form entity in the system.
 *
 * @property id Unique identifier for the form.
 * @property name Name of the form.
 * @property header Header text displayed on the form.
 * @property description Description of the form.
 * @property inputPlaceholder Placeholder text for input fields.
 * @property buttonText Text displayed on the form's button.
 * @property buttonColor Hex color code for the button.
 * @property backgroundColor Hex color code for the form's background.
 * @property textColor Hex color code for the text.
 * @property buttonTextColor Hex color code for the button text.
 * @property workspaceId Identifier for the workspace associated with the form.
 * @property createdAt Timestamp when the form was created.
 * @property updatedAt Timestamp when the form was last updated.
 */
data class Form(
    override val id: FormId,
    val name: String,
    val header: String,
    val description: String,
    val inputPlaceholder: String,
    val buttonText: String,
    val buttonColor: HexColor,
    val backgroundColor: HexColor,
    val textColor: HexColor,
    val buttonTextColor: HexColor,
    val workspaceId: WorkspaceId,
    override val createdAt: LocalDateTime,
    override val updatedAt: LocalDateTime?,
) : BaseEntity<FormId>() {

    /**
     * Updates the form with new configuration values.
     *
     * @param formConfiguration The new configuration values for the form.
     * @return A new immutable instance of the form with updated values,
     * or the current instance if no changes are detected.
     */
    fun update(formConfiguration: FormConfiguration): Form {
        val candidate = fromConfiguration(
            id = this.id,
            workspaceId = this.workspaceId,
            createdAt = this.createdAt,
            formConfiguration = formConfiguration,
            updatedAt = LocalDateTime.now(),
        )

        // If no changes are detected, return the current instance.
        if (candidate.copy(updatedAt = this.updatedAt) == this) {
            return this
        }

        // Record the update event and return the new instance.
        candidate.record(
            FormUpdatedEvent(
                id = this.id.value.toString(),
                name = candidate.name,
                header = candidate.header,
                description = candidate.description,
                inputPlaceholder = candidate.inputPlaceholder,
                buttonText = candidate.buttonText,
                buttonColor = candidate.buttonColor.value,
                backgroundColor = candidate.backgroundColor.value,
                textColor = candidate.textColor.value,
                buttonTextColor = candidate.buttonTextColor.value,
            ),
        )
        return candidate
    }

    companion object {
        /**
         * Creates a new Form instance.
         *
         * @param id Unique identifier for the form.
         * @param workspaceId Unique identifier for the associated workspace.
         * @param formConfiguration Configuration values for the form.
         * @param now Current timestamp for creation and update.
         * @return A new Form instance.
         */
        fun create(
            id: UUID,
            workspaceId: UUID,
            formConfiguration: FormConfiguration,
            now: LocalDateTime = LocalDateTime.now()
        ): Form {
            val form = fromConfiguration(
                id = FormId(id),
                workspaceId = WorkspaceId(workspaceId),
                createdAt = now,
                updatedAt = now,
                formConfiguration = formConfiguration,
            )
            form.record(FormCreatedEvent(id.toString()))
            return form
        }

        /**
         * Constructs a Form instance from configuration values.
         *
         * @param id Unique identifier for the form.
         * @param workspaceId Unique identifier for the associated workspace.
         * @param createdAt Timestamp when the form was created.
         * @param updatedAt Timestamp when the form was last updated.
         * @param formConfiguration Configuration values for the form.
         * @return A Form instance populated with the provided configuration values.
         * @throws IllegalArgumentException If the configuration values are invalid.
         */
        private fun fromConfiguration(
            id: FormId,
            workspaceId: WorkspaceId,
            createdAt: LocalDateTime,
            updatedAt: LocalDateTime?,
            formConfiguration: FormConfiguration
        ): Form {
            try {
                return Form(
                    id = id,
                    workspaceId = workspaceId,
                    name = formConfiguration.name,
                    header = formConfiguration.header,
                    description = formConfiguration.description,
                    inputPlaceholder = formConfiguration.inputPlaceholder,
                    buttonText = formConfiguration.buttonText,
                    buttonColor = HexColor(formConfiguration.buttonColor),
                    backgroundColor = HexColor(formConfiguration.backgroundColor),
                    textColor = HexColor(formConfiguration.textColor),
                    buttonTextColor = HexColor(formConfiguration.buttonTextColor),
                    createdAt = createdAt,
                    updatedAt = updatedAt,
                )
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid form configuration: ${e.message}", e)
            }
        }
    }
}
