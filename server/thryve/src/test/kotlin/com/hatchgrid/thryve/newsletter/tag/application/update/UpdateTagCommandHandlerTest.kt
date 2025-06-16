package com.hatchgrid.thryve.newsletter.tag.application.update

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.application.search.email.GetAllSubscribersByEmailService
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.application.create.SubscriberTagCreator
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.TagSearchRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagSubscriberDeletedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagSubscriberUpdatedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagUpdatedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.exceptions.TagNotFoundException
import com.hatchgrid.common.domain.bus.event.EventPublisher
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class UpdateTagCommandHandlerTest {
    private val eventPublisher: EventPublisher<TagUpdatedEvent> = mockk()
    private val tagRepository: TagRepository = mockk()
    private val tagSearchRepository: TagSearchRepository = mockk()
    private val subscriberSearchRepository: SubscriberSearchRepository = mockk()
    private val subscriberTagCreator: SubscriberTagCreator = mockk()
    private val subscriberTagRepository: SubscriberTagRepository = mockk()
    private val allSubscribersByEmailService: GetAllSubscribersByEmailService =
        GetAllSubscribersByEmailService(subscriberSearchRepository)
    private val tagUpdater = TagUpdater(
        tagRepository,
        tagSearchRepository,
        allSubscribersByEmailService,
        subscriberTagCreator,
        subscriberTagRepository,
        eventPublisher,
    )
    private val updateTagCommandHandler = UpdateTagCommandHandler(tagUpdater)
    private val tag = TagStub.create()
    private val tagId = tag.id
    private val workspaceId = tag.workspaceId

    @BeforeEach
    fun setUp() {
        coEvery { tagSearchRepository.findById(workspaceId, tagId) } returns tag
        coEvery { eventPublisher.publish(any(TagUpdatedEvent::class)) } returns Unit
        coEvery { tagRepository.update(tag) } returns Unit
        coEvery { subscriberTagCreator.create(any(), any()) } returns Unit
        coEvery { subscriberTagRepository.delete(any()) } returns Unit

        coEvery {
            subscriberSearchRepository.searchAllByEmails(
                workspaceId,
                any(),
            )
        } returns listOf()
    }

    @Test
    fun `should update tag name and color`() = runBlocking {
        // Given
        val command = UpdateTagCommand(
            id = tagId.value.toString(),
            name = "new name",
            color = "red",
            workspaceId = workspaceId.value.toString(),
            subscribers = null,
        )

        // When
        updateTagCommandHandler.handle(command)

        // Then
        coVerify { tagRepository.update(tag) }
        coVerify { eventPublisher.publish(any<TagUpdatedEvent>()) }
    }

    @Test
    fun `should update tag with subscribers added`() = runBlocking {
        // Given
        val subscribers = setOf("test.email1@example.com", "test.email2@example.com")
        coEvery {
            subscriberSearchRepository.searchAllByEmails(
                workspaceId,
                subscribers,
            )
        } returns listOf(
            SubscriberStub.create(email = "test.email1@example.com"),
            SubscriberStub.create(email = "test.email2@example.com"),
        )
        val command = UpdateTagCommand(
            id = tagId.value.toString(),
            name = "new name",
            color = "blue",
            workspaceId = workspaceId.value.toString(),
            subscribers = subscribers,
        )

        // When
        updateTagCommandHandler.handle(command)

        // Then
        coVerify { subscriberTagCreator.create(any(), any()) } // Add new subscribers
        coVerify { tagRepository.update(tag) }
        coVerify { eventPublisher.publish(any<TagUpdatedEvent>()) }
        coVerify { eventPublisher.publish(any<TagSubscriberUpdatedEvent>()) }
    }

    @Test
    fun `should update tag and remove subscribers`() = runBlocking {
        // Given
        val subscribers = tag.subscribers ?: emptySet()
        val subscribersToRemove = subscribers.take(3).toSet() // Removemos los primeros 3
        val remainingSubscribers = subscribers - subscribersToRemove

        coEvery {
            subscriberSearchRepository.searchAllByEmails(
                workspaceId,
                subscribersToRemove.map { it.value }.toSet(),
            )
        } returns subscribersToRemove.map { SubscriberStub.create(email = it.value) }

        val command = UpdateTagCommand(
            id = tagId.value.toString(),
            name = "new name",
            color = null,
            workspaceId = workspaceId.value.toString(),
            subscribers = remainingSubscribers.map { it.value }.toSet(),
        )

        // When
        updateTagCommandHandler.handle(command)

        // Then
        coVerify(exactly = 3) { subscriberTagRepository.delete(any()) }
        coVerify { tagRepository.update(tag) }
        coVerify { eventPublisher.publish(any<TagUpdatedEvent>()) }
        coVerify { eventPublisher.publish(any<TagSubscriberDeletedEvent>()) }
    }

    @Test
    fun `should handle update with no name, color, or subscribers`() = runBlocking {
        // Given
        val command = UpdateTagCommand(
            id = tagId.value.toString(),
            name = null,
            color = null,
            workspaceId = workspaceId.value.toString(),
            subscribers = null,
        )

        // When
        updateTagCommandHandler.handle(command)

        // Then
        coVerify { tagRepository.update(tag) }
        coVerify { eventPublisher.publish(any<TagUpdatedEvent>()) }
    }

    @Test
    fun `should not update if tag is not found`() = runBlocking {
        // Given
        coEvery { tagSearchRepository.findById(workspaceId, tagId) } returns null
        val command = UpdateTagCommand(
            id = tagId.value.toString(),
            name = "new name",
            color = "yellow",
            workspaceId = workspaceId.value.toString(),
            subscribers = setOf("test.email1@example.com"),
        )

        // When / Then
        assertThrows<TagNotFoundException> {
            runBlocking {
                updateTagCommandHandler.handle(command)
            }
        }
        coVerify(exactly = 0) { tagRepository.update(any()) }
        coVerify(exactly = 0) { eventPublisher.publish(any<TagUpdatedEvent>()) }
    }
}
