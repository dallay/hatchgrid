package com.hatchgrid.thryve.form.application.search

import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.GeneralStub.getTimestampCursorPage
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.time.LocalDateTime
import java.util.UUID
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

private const val NUM_FORMS = 100

internal class SearchFormsQueryHandlerTest {
    private lateinit var repository: FormFinderRepository
    private lateinit var searcher: FormsSearcher
    private lateinit var workspaceMemberRepository: WorkspaceMemberRepository
    private lateinit var workspaceAuthorizationService: WorkspaceAuthorizationService
    private lateinit var searchFormsQueryHandler: SearchFormsQueryHandler
    private lateinit var workspaceId: UUID
    private lateinit var userId: UUID

    @BeforeEach
    fun setUp() {
        workspaceId = UUID.randomUUID()
        userId = UUID.randomUUID()
        repository = mockk()
        workspaceMemberRepository = mockk()
        searcher = FormsSearcher(repository)
        workspaceAuthorizationService = WorkspaceAuthorizationService(workspaceMemberRepository)
        searchFormsQueryHandler = SearchFormsQueryHandler(workspaceAuthorizationService, searcher)
        val cursorPageResponse = FormStub.dummyRandomFormsPageResponse(NUM_FORMS)

        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(eq(workspaceId), eq(userId))
        } returns true

        coEvery {
            repository.search(
                any(Criteria::class),
                any(Int::class),
                any(Sort::class),
            )
        } returns cursorPageResponse
    }

    @Test
    fun `should search all forms`() = runTest {
        // Given
        val query = SearchFormsQuery(
            workspaceId = workspaceId.toString(),
            userId = userId.toString(),
            criteria = Criteria.Empty,
        )

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
    fun `should search forms with criteria`() = runTest {
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

        val query = SearchFormsQuery(
            workspaceId = workspaceId.toString(),
            userId = userId.toString(),
            criteria = criteria,
        )

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
