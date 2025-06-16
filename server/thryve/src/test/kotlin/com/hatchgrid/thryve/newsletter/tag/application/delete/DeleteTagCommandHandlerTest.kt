package com.hatchgrid.thryve.newsletter.tag.application.delete

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.DeleteTagEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.bus.event.EventPublisher
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class DeleteTagCommandHandlerTest {
    private val eventPublisher: EventPublisher<DeleteTagEvent> = mockk()
    private val tagRepository: TagRepository = mockk()
    private val tagDestroyer = TagDestroyer(tagRepository, eventPublisher)
    private val deleteTagCommandHandler = DeleteTagCommandHandler(tagDestroyer)
    private lateinit var workspaceId: WorkspaceId
    private lateinit var tagId: TagId
    private lateinit var tag: Tag

    @BeforeEach
    fun setUp() {
        workspaceId = WorkspaceId(UUID.randomUUID())
        tagId = TagId(UUID.randomUUID())
        tag = TagStub.create(
            id = tagId.value.toString(),
            workspaceId = workspaceId.value.toString(),
        )

        coEvery { tagRepository.delete(workspaceId, tagId) } returns Unit
        coEvery { eventPublisher.publish(any(DeleteTagEvent::class)) } returns Unit
    }

    @Test
    fun `should delete a tag`() = runBlocking {
        // Given
        val command = DeleteTagCommand(
            workspaceId = workspaceId.value.toString(),
            tagId = tagId.value.toString(),
        )

        // When
        deleteTagCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            tagRepository.delete(workspaceId, tagId)
        }

        coVerify(exactly = 1) {
            eventPublisher.publish(ofType(DeleteTagEvent::class))
        }
    }
}
