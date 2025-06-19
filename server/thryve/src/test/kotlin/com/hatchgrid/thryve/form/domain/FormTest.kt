package com.hatchgrid.thryve.form.domain

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.form.domain.dto.FormStyleConfiguration
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import java.time.LocalDateTime
import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class FormTest {

    private val validStyleConfig = FormStyleConfiguration(
        name = "Test Form",
        header = "Test Header",
        description = "Test Description",
        inputPlaceholder = "Test Placeholder",
        buttonText = "Submit",
        buttonColor = "#FF0000",
        backgroundColor = "#FFFFFF",
        textColor = "#000000",
        buttonTextColor = "#FFFFFF",
    )

    @Test
    fun `should create form with valid configuration`() {
        val id = UUID.randomUUID()
        val workspaceId = UUID.randomUUID()
        val now = LocalDateTime.now()

        val form = Form.create(
            id = id,
            styleConfiguration = validStyleConfig,
            workspaceId = workspaceId,
            createdAt = now,
        )

        assertEquals(id, form.id.value)
        assertEquals(workspaceId, form.workspaceId.value)
        assertEquals(validStyleConfig.name, form.name)
        assertEquals(validStyleConfig.buttonColor, form.buttonColor.value)
        assertEquals(now, form.createdAt)
        assertEquals(now, form.updatedAt)
        assertNotNull(form.pullDomainEvents().find { it is FormCreatedEvent })
    }

    @Test
    fun `should update form with new style configuration`() {
        val form = Form.create(
            id = UUID.randomUUID(),
            styleConfiguration = validStyleConfig,
            workspaceId = UUID.randomUUID(),
        )

        val updatedConfig = validStyleConfig.copy(
            buttonColor = "#00FF00",
            name = "Updated Form",
        )

        form.update(updatedConfig)

        assertEquals(updatedConfig.buttonColor, form.buttonColor.value)
        assertEquals(updatedConfig.name, form.name)
        assertNotNull(form.pullDomainEvents().find { it is FormUpdatedEvent })
    }

    @Test
    fun `should throw exception when creating form with invalid color format`() {
        val invalidConfig = validStyleConfig.copy(
            buttonColor = "invalid-color",
        )

        assertThrows<IllegalArgumentException> {
            Form.create(
                id = UUID.randomUUID(),
                styleConfiguration = invalidConfig,
                workspaceId = UUID.randomUUID(),
            )
        }
    }
}
