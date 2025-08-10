package com.hatchgrid.thryve.newsletter.tag.application.list

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagSearchRepository
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class GetAllTagsQueryHandlerTest {
    private val repository = mockk<TagSearchRepository>()
    private val searcher = AllTagSearcher(repository)
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private val handler = GetAllTagsQueryHandler(workspaceAuthorizationService, searcher)
    private val wId = "27172d5a-b88e-451c-9787-312706f4570d"
    private val uId = "fd5ca30f-ec5c-4939-9ada-66bb3f58b4bb"
    private val workspaceId = WorkspaceId(wId)
    private val userId = UserId(uId)
    private lateinit var tags: List<Tag>

    @BeforeEach
    fun setUp() {
        tags = TagStub.randomTagsList(30)
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery { repository.findAllTagsByWorkspaceId(workspaceId) } returns tags
    }

    @Test
    fun `should find all tags by workspace id`() = runTest {
        // Given
        val query = GetAllTagsQuery(wId, uId)

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 1) { repository.findAllTagsByWorkspaceId(workspaceId) }
        result.data.forEachIndexed { index, tag ->
            val expectedTag = tags[index]
            assertEquals(expectedTag.id.value.toString(), tag.id.toString())
            assertEquals(expectedTag.name, tag.name)
            assertEquals(expectedTag.workspaceId.value.toString(), tag.workspaceId.toString())
            assertEquals(expectedTag.numberOfSubscribers(), tag.subscribers?.size ?: 0)
            assertEquals(expectedTag.createdAt.toString(), tag.createdAt.toString())
            assertEquals(expectedTag.updatedAt.toString(), tag.updatedAt.toString())
        }
    }
}
