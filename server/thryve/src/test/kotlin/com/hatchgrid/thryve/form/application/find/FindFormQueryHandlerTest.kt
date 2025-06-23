package com.hatchgrid.thryve.form.application.find

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class FindFormQueryHandlerTest {

    private lateinit var formFinder: FormFinder
    private lateinit var findFormQueryHandler: FindFormQueryHandler

    @BeforeEach
    fun setup() {
        formFinder = mockk()
        findFormQueryHandler = FindFormQueryHandler(formFinder)
    }

    @Test
    fun `should return form response when form is found`() = runBlocking {
        // Given
        val formUuid = UUID.randomUUID().toString()
        val organizaitionUuid = UUID.randomUUID().toString()
        val formId = FormId(formUuid)
        val workspaceId = WorkspaceId(organizaitionUuid)
        val form = FormStub.create(id = formUuid, workspaceId = organizaitionUuid)
        val formResponse = FormResponse.from(form)
        coEvery {
            formFinder.find(
                workspaceId = workspaceId,
                formId = formId,
            )
        } returns form

        // When
        val result = findFormQueryHandler.handle(FindFormQuery(workspaceId = organizaitionUuid, formId = formUuid))

        // Then
        assertEquals(formResponse, result)
        coVerify(exactly = 1) { formFinder.find(workspaceId, formId) }
    }

    @Test
    fun `should throw exception when form is not found`() {
        // Given
        val formUuid = UUID.randomUUID().toString()
        val workspaceUuid = UUID.randomUUID().toString()
        val formId = FormId(formUuid)
        val workspaceId = WorkspaceId(workspaceUuid)
        coEvery { formFinder.find(workspaceId = workspaceId, formId = formId) } returns null

        // Then
        assertThrows(FormNotFoundException::class.java) {
            // When
            runBlocking {
                findFormQueryHandler.handle(FindFormQuery(workspaceId = workspaceUuid, formId = formUuid))
            }
        }
        coVerify(exactly = 1) { formFinder.find(workspaceId, formId) }
    }
}
