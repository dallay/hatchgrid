package com.hatchgrid.thryve.workspace.application.find.by.member

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import io.mockk.coEvery
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class AllWorkspaceByMemberQueryHandlerTest {
    private lateinit var repository: WorkspaceFinderRepository
    private lateinit var finder: AllWorkspaceByMemberFinder
    private lateinit var handler: AllWorkspaceByMemberQueryHandler
    private lateinit var workspaces: List<Workspace>
    private lateinit var userId: UserId

    @BeforeEach
    fun setUp() {
        repository = mockk()
        finder = AllWorkspaceByMemberFinder(repository)
        handler = AllWorkspaceByMemberQueryHandler(finder)
        workspaces = WorkspaceStub.dummyRandomWorkspaces(6)
        userId = UserId(UUID.randomUUID())

        coEvery { repository.findByMemberId(userId) } returns workspaces
    }

    @Test
    fun `should find all workspaces`() = runBlocking {
        // Given
        val query = AllWorkspaceByMemberQuery(userId.value.toString())

        // When
        val response = handler.handle(query)

        // Then
        assertEquals(workspaces.size, response.data.size)
    }

    @Test
    fun `should return empty list when no workspaces found`() = runBlocking {
        // Given
        coEvery { repository.findByMemberId(any()) } returns emptyList()
        val query = AllWorkspaceByMemberQuery(userId.value.toString())

        // When
        val response = handler.handle(query)

        // Then
        assertEquals(0, response.data.size)
    }

    @Test
    fun `should handle repository exception`(): Unit = runBlocking {
        // Given
        coEvery { repository.findByMemberId(any()) } throws RuntimeException("Database error")
        val query = AllWorkspaceByMemberQuery(userId.value.toString())

        // When & Then
        assertThrows<RuntimeException> {
            runBlocking { handler.handle(query) }
        }
    }
}
