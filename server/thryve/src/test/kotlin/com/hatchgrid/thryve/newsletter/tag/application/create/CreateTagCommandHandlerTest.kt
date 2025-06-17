package com.hatchgrid.thryve.newsletter.tag.application.create

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.application.search.email.GetAllSubscribersByEmailService
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagRepository
import com.hatchgrid.thryve.newsletter.tag.domain.event.SubscriberTaggedEvent
import com.hatchgrid.thryve.newsletter.tag.domain.event.TagCreatedEvent
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.UUID
import kotlinx.coroutines.runBlocking
import net.datafaker.Faker
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CreateTagCommandHandlerTest {
    private val eventPublisher: EventPublisher<TagCreatedEvent> = mockk()
    private val subscriberTaggedEventPublisher: EventPublisher<SubscriberTaggedEvent> = mockk()
    private val tagRepository = mockk<TagRepository>()
    private val subscriberSearchRepository = mockk<SubscriberSearchRepository>()
    private val getAllSubscribersByEmailService =
        GetAllSubscribersByEmailService(subscriberSearchRepository)
    private val subscriberTagRepository: SubscriberTagRepository = mockk()
    private val subscriberTagCreator =
        SubscriberTagCreator(subscriberTagRepository, subscriberTaggedEventPublisher)
    private val tagCreator = TagCreator(
        tagRepository,
        getAllSubscribersByEmailService,
        subscriberTagCreator,
        eventPublisher,
    )
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private val createTagCommandHandler = CreateTagCommandHandler(workspaceAuthorizationService, tagCreator)
    private val faker = Faker()
    private val name = faker.lorem().word()
    private val allColorSupported = listOf("default", "purple", "pink", "red", "blue", "yellow")
    private val tagId = UUID.randomUUID().toString()
    private val workspaceId = WorkspaceId(UUID.randomUUID())
    private val userId = UserId(UUID.randomUUID())
    private lateinit var color: String
    private lateinit var subscribers: List<Subscriber>
    private lateinit var emails: Set<String>

    @BeforeEach
    fun setUp() {
        color = allColorSupported.random()
        subscribers = SubscriberStub.dummyRandomSubscribersList(20)
        emails = subscribers.map { it.email.value }.toSet()

        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery { tagRepository.create(any(Tag::class)) } returns Unit
        coEvery { subscriberTagRepository.create(any()) } returns Unit
        coEvery {
            subscriberSearchRepository.searchAllByEmails(
                workspaceId,
                emails,
            )
        } returns subscribers
        coEvery { eventPublisher.publish(any(TagCreatedEvent::class)) } returns Unit
        coEvery { subscriberTaggedEventPublisher.publish(any(SubscriberTaggedEvent::class)) } returns Unit
    }

    @Test
    fun `should create a tag`(): Unit = runBlocking {
        // Given
        val command = CreateTagCommand(
            id = tagId,
            name = name,
            color = color,
            workspaceId = workspaceId.value.toString(),
            userId = userId.value.toString(),
            subscribers = emails,
        )

        // When
        createTagCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            tagRepository.create(
                withArg {
                    assert(it.id.value.toString() == tagId)
                    assert(it.name == name)
                    assert(it.color.value == color)
                    assert(it.workspaceId == workspaceId)
                },
            )
        }
    }
}
