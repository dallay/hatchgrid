package com.hatchgrid.thryve.workspace.application.delete

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceDeletedEvent
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class DeleteWorkspaceCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<WorkspaceDeletedEvent>
    private lateinit var repository: WorkspaceRepository
    private lateinit var destroyer: WorkspaceDestroyer
    private lateinit var deleteWorkspaceCommandHandler: DeleteWorkspaceCommandHandler
    private lateinit var workspaceId: String

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        repository = mockk()
        destroyer = WorkspaceDestroyer(repository, eventPublisher)
        deleteWorkspaceCommandHandler = DeleteWorkspaceCommandHandler(destroyer)
        workspaceId = UUID.randomUUID().toString()

        coEvery { repository.delete(any()) } returns Unit
        coEvery { eventPublisher.publish(any<WorkspaceDeletedEvent>()) } returns Unit
    }

    @Test
    fun `should delete an workspace and publish event when handle is called`() = runBlocking {
        // Given
        val command = DeleteWorkspaceCommand(id = workspaceId)

        // When
        deleteWorkspaceCommandHandler.handle(command)

        // Then
        coVerify {
            repository.delete(
                withArg {
                    assert(it.value.toString() == workspaceId)
                },
            )
        }
        coVerify { eventPublisher.publish(ofType<WorkspaceDeletedEvent>()) }
    }
}
