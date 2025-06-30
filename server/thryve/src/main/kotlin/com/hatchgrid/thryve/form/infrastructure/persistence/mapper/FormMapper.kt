package com.hatchgrid.thryve.form.infrastructure.persistence.mapper

import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.HexColor
import com.hatchgrid.thryve.form.infrastructure.persistence.entity.FormEntity
import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * Object responsible for mapping between the Form domain object and the FormEntity persistence object.
 */
object FormMapper {
    /**
     * Extension function to convert a Form domain object to a FormEntity persistence object.
     *
     * @return The FormEntity object.
     */
    fun Form.toEntity(): FormEntity = FormEntity(
        id = id.value,
        name = name,
        header = header,
        description = description,
        inputPlaceholder = inputPlaceholder,
        buttonText = buttonText,
        buttonColor = buttonColor.hex,
        backgroundColor = backgroundColor.hex,
        textColor = textColor.hex,
        buttonTextColor = buttonTextColor.hex,
        workspaceId = workspaceId.value,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )

    /**
     * Function to convert a FormEntity persistence object to a Form domain object.
     *
     * @return The Form domain object.
     */
    fun FormEntity.toDomain(): Form = Form(
        id = FormId(id),
        name = name,
        header = header,
        description = description,
        inputPlaceholder = inputPlaceholder,
        buttonText = buttonText,
        buttonColor = HexColor(buttonColor),
        backgroundColor = HexColor(backgroundColor),
        textColor = HexColor(textColor),
        buttonTextColor = HexColor(buttonTextColor),
        workspaceId = WorkspaceId(workspaceId),
        createdAt = createdAt,
        updatedAt = updatedAt,
    )
}
