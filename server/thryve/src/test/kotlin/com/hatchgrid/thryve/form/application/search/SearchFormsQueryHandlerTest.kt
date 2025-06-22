package com.hatchgrid.thryve.form.application.search

import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.GeneralStub.getTimestampCursorPage
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.time.LocalDateTime
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

private const val NUM_FORMS = 100

internal class SearchFormsQueryHandlerTest {
    private lateinit var repository: FormFinderRepository
    private lateinit var searcher: FormsSearcher
    private lateinit var searchFormsQueryHandler: SearchFormsQueryHandler

    @BeforeEach
    fun setUp() {
        repository = mockk()
        searcher = FormsSearcher(repository)
        searchFormsQueryHandler = SearchFormsQueryHandler(searcher)
        val cursorPageResponse = FormStub.dummyRandomFormsPageResponse(NUM_FORMS)

        coEvery {
            repository.search(
                any(Criteria::class),
                any(Int::class),
                any(Sort::class),
            )
        } returns cursorPageResponse
    }

    @Test
    fun `should search all forms`() = runBlocking {
        // Given
        val query = SearchFormsQuery(criteria = Criteria.Empty)

        // When
        val response = searchFormsQueryHandler.handle(query)

        // Then
        val data = response.data
        val nextCursor = response.nextPageCursor
        assertTrue(data.isNotEmpty())
        assertEquals(NUM_FORMS, data.size)
        val endDate = data.last().createdAt ?: LocalDateTime.now().toString()
        val cursor = getTimestampCursorPage(endDate)
        assertEquals(cursor, nextCursor)

        coVerify(exactly = 1) { repository.search(any(Criteria::class), any(Int::class), any(Sort::class)) }
    }

    @Test
    fun `should search forms with criteria`() = runBlocking {
        // Given
        val criteria = Criteria.Or(
            listOf(
                Criteria.GreaterThan("createdAt", LocalDateTime.now().minusDays(1)),
                Criteria.LessThan("createdAt", LocalDateTime.now().plusDays(1)),
            ),
        )
        val dummyRandomFormsPageResponse = FormStub.dummyRandomFormsPageResponse(1)
        coEvery {
            repository.search(any(Criteria::class), any(Int::class), any(Sort::class))
        } returns dummyRandomFormsPageResponse

        val query = SearchFormsQuery(criteria = criteria)

        // When
        val response = searchFormsQueryHandler.handle(query)

        // Then
        val data = response.data
        val nextCursor = response.nextPageCursor
        assertTrue(data.isNotEmpty())
        assertEquals(1, data.size)
        val endDate = data.last().createdAt ?: LocalDateTime.now().toString()
        val cursor = getTimestampCursorPage(endDate)
        assertEquals(cursor, nextCursor)

        coVerify(exactly = 1) { repository.search(any(Criteria::class), any(Int::class), any(Sort::class)) }
    }
}
