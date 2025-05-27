package com.hatchgrid.thryve.workspace.application.find

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.application.WorkspaceResponse
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceNotFoundException
import io.mockk.coEvery
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class FindWorkspaceQueryHandlerTest {

    private lateinit var workspaceFinder: WorkspaceFinder
    private lateinit var findWorkspaceQueryHandler: FindWorkspaceQueryHandler

    @BeforeEach
    fun setup() {
        workspaceFinder = mockk()
        findWorkspaceQueryHandler = FindWorkspaceQueryHandler(workspaceFinder)
    }

    @Test
    fun `should return workspace response when workspace is found`() = runBlocking {
        // Given
        val id = UUID.randomUUID().toString()
        val workspaceId = WorkspaceId(id)
        val workspace = WorkspaceStub.create()
        val workspaceResponse = WorkspaceResponse.from(workspace)
        coEvery { workspaceFinder.find(workspaceId) } returns workspace

        // When
        val result = findWorkspaceQueryHandler.handle(FindWorkspaceQuery(id))

        // Then
        assertEquals(workspaceResponse, result)
    }

    @Test
    fun `should throw exception when workspace is not found`(): Unit = runBlocking {
        // Given
        val id = UUID.randomUUID().toString()
        val workspaceId = WorkspaceId(id)
        coEvery { workspaceFinder.find(workspaceId) } returns null

        // Then
        assertThrows(WorkspaceNotFoundException::class.java) {
            // When
            runBlocking {
                findWorkspaceQueryHandler.handle(FindWorkspaceQuery(id))
            }
        }
    }
}
