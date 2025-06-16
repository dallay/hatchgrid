package com.hatchgrid.thryve.newsletter.tag

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTag
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTagId
import com.hatchgrid.thryve.newsletter.tag.domain.Tag
import com.hatchgrid.thryve.newsletter.tag.domain.TagColor
import com.hatchgrid.thryve.newsletter.tag.domain.TagId
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.CreateTagRequest
import com.hatchgrid.thryve.newsletter.tag.infrastructure.http.request.UpdateTagRequest
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.vo.email.Email
import java.util.UUID
import kotlin.String
import kotlin.collections.Set
import net.datafaker.Faker

object TagStub {
    private val faker = Faker()
    private val objectMapper = jacksonObjectMapper()
    private val allColorSupported = listOf("default", "purple", "pink", "red", "blue", "yellow")
    private val subscriberEmails = (0 until 1000).map { faker.internet().emailAddress() }.toSet()
    fun create(
        id: String = UUID.randomUUID().toString(),
        name: String = faker.lorem().word(),
        color: String = allColorSupported.random(),
        subscribers: Set<String> = subscriberEmails.take(10).toSet(),
        workspaceId: String = UUID.randomUUID().toString()
    ) = Tag(
        id = TagId(id),
        name = name,
        color = TagColor.fromString(color),
        workspaceId = WorkspaceId(workspaceId),
        subscribers = subscribers.map { Email(it) }.toMutableSet(),
    )

    fun createSubscriberTag(
        subscriberId: UUID = UUID.randomUUID(),
        tagId: UUID = UUID.randomUUID()
    ): SubscriberTag = SubscriberTag(
        id = SubscriberTagId(subscriberId, tagId),
    )

    fun generateTagRequest(
        name: String = faker.lorem().word(),
        color: String = allColorSupported.random(),
        subscriberEmails: Set<String> = (0 until 10).map { faker.internet().emailAddress() }.toSet(),
        isUpdate: Boolean = false
    ): String =
        objectMapper.writeValueAsString(
            if (isUpdate) {
                UpdateTagRequest(name, color, subscriberEmails)
            } else {
                CreateTagRequest(name, color, subscriberEmails)
            },
        )

    fun randomTagsList(size: Int = 10): List<Tag> = (0 until size).map { create() }
}
