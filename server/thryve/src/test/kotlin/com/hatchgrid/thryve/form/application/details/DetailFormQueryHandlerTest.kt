package com.hatchgrid.thryve.form.application.details

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
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
internal class DetailFormQueryHandlerTest {

    private lateinit var detailFormFetcher: DetailFormFetcher
    private lateinit var findFormQueryHandler: DetailFormQueryHandler

    @BeforeEach
    fun setup() {
        detailFormFetcher = mockk()
        findFormQueryHandler = DetailFormQueryHandler(detailFormFetcher)
    }

    @Test
    fun `should return form response when form is found`() = runBlocking {
        // Given
        val fID = UUID.randomUUID().toString()
        val wID = UUID.randomUUID().toString()
        val formId = FormId(fID)
        val form = FormStub.create(id = fID, workspaceId = wID)
        val formResponse = FormResponse.from(form)
        coEvery {
            detailFormFetcher.find(
                formId = formId,
            )
        } returns form

        // When
        val result = findFormQueryHandler.handle(DetailFormQuery(fID))

        // Then
        assertEquals(formResponse, result)
        coVerify(exactly = 1) { detailFormFetcher.find(formId) }
    }

    @Test
    fun `should throw exception when form is not found`() {
        // Given
        val formUuid = UUID.randomUUID().toString()
        val formId = FormId(formUuid)
        coEvery { detailFormFetcher.find(formId) } returns null

        // Then
        assertThrows(FormNotFoundException::class.java) {
            // When
            runBlocking {
                findFormQueryHandler.handle(DetailFormQuery(formUuid))
            }
        }
        coVerify(exactly = 1) { detailFormFetcher.find(formId) }
    }
}
