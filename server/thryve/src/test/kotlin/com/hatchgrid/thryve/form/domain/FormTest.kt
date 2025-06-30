package com.hatchgrid.thryve.form.domain

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.form.domain.event.FormCreatedEvent
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import java.time.LocalDateTime
import java.util.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class FormTest {

    private val validStyleConfig = FormConfiguration(
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
            formConfiguration = validStyleConfig,
            workspaceId = workspaceId,
            now = now,
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
            formConfiguration = validStyleConfig,
            workspaceId = UUID.randomUUID(),
        )

        val updatedConfig = validStyleConfig.copy(
            buttonColor = "#00FF00",
            name = "Updated Form",
        )

        val updateForm = form.update(updatedConfig)

        assertEquals(updatedConfig.buttonColor, updateForm.buttonColor.value)
        assertEquals(updatedConfig.name, updateForm.name)
        assertNotNull(updateForm.pullDomainEvents().find { it is FormUpdatedEvent })
    }

    @Test
    fun `should throw exception when creating form with invalid color format`() {
        val invalidConfig = validStyleConfig.copy(
            buttonColor = "invalid-color",
        )

        val exception = assertThrows<IllegalArgumentException> {
            Form.create(
                id = UUID.randomUUID(),
                formConfiguration = invalidConfig,
                workspaceId = UUID.randomUUID(),
            )
        }
        assertTrue(exception.message?.contains("Invalid hexadecimal color code") == true)
    }
}
