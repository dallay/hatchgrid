package com.hatchgrid.thryve.newsletter.subscriber.application.search.all

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.GeneralStub.getTimestampCursorPage
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.mockkClass
import java.time.LocalDateTime
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

private const val NUM_SUBSCRIBER = 100

@UnitTest
internal class SearchAllSubscribersQueryHandlerTest {
    private lateinit var repository: SubscriberSearchRepository
    private lateinit var workspaceMemberRepository: WorkspaceMemberRepository
    private lateinit var workspaceAuthorizationService: WorkspaceAuthorizationService
    private lateinit var searcher: SearchAllSubscriberSearcher
    private lateinit var searchAllSubscribersQueryHandler: SearchAllSubscribersQueryHandler
    private lateinit var workspaceId: UUID
    private lateinit var userId: UUID

    @BeforeEach
    fun setUp() {
        workspaceId = UUID.randomUUID()
        userId = UUID.randomUUID()
        repository = mockkClass(SubscriberSearchRepository::class)
        workspaceMemberRepository = mockk()
        searcher = SearchAllSubscriberSearcher(repository)
        workspaceAuthorizationService = WorkspaceAuthorizationService(workspaceMemberRepository)
        searchAllSubscribersQueryHandler = SearchAllSubscribersQueryHandler(workspaceAuthorizationService, searcher)

        val cursorPageResponse = SubscriberStub.dummyRandomSubscribersPageResponse(NUM_SUBSCRIBER)

        coEvery {
            repository.searchAllByCursor(any(Criteria::class), any(Int::class), any(Sort::class))
        } returns cursorPageResponse
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(eq(workspaceId), eq(userId))
        } returns true
    }

    @Test
    fun `should search all subscribers`() = runBlocking {
        // Given
        val query = SearchAllSubscribersQuery(workspaceId.toString(), userId.toString(), criteria = Criteria.Empty)

        // When
        val response = searchAllSubscribersQueryHandler.handle(query)

        // Then
        val data = response.data
        val nextCursor = response.nextPageCursor
        assertTrue(data.isNotEmpty())
        assertEquals(NUM_SUBSCRIBER, data.size)
        val endDate = data.last().createdAt ?: LocalDateTime.now().toString()
        val cursor = getTimestampCursorPage(endDate)
        assertEquals(cursor, nextCursor)
        coVerify(exactly = 1) { repository.searchAllByCursor(any(Criteria::class), any(Int::class), any(Sort::class)) }
    }
}
