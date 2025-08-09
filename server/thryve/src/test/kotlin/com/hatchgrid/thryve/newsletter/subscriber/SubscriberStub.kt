package com.hatchgrid.thryve.newsletter.subscriber

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.pagination.TimestampCursor
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.common.domain.vo.name.Name
import com.hatchgrid.thryve.GeneralStub.getTimestampCursorPage
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.thryve.newsletter.subscriber.domain.Attributes
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberId
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import java.io.FileNotFoundException
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*
import net.datafaker.Faker

object SubscriberStub {
    private val faker = Faker()
    fun create(
        id: String = UUID.randomUUID().toString(),
        email: String = faker.internet().emailAddress(),
        firstname: String = faker.name().firstName(),
        lastname: String = faker.name().lastName(),
        status: SubscriberStatus = SubscriberStatus.ENABLED,
        workspaceId: String = UUID.randomUUID().toString(),
        attributes: Attributes = Attributes(tags = listOf("tag1", "tag2"))
    ): Subscriber = Subscriber(
        id = SubscriberId(id),
        email = Email(email),
        name = Name(FirstName(firstname), LastName(lastname)),
        status = status,
        workspaceId = WorkspaceId(workspaceId),
        attributes = attributes,
    )
    fun dummyRandomSubscribersList(size: Int = 10): List<Subscriber> {
        return (1..size).map {
            create()
        }
    }

    fun dummyRandomSubscribersPageResponse(size: Int = 10): CursorPageResponse<Subscriber> {
        val data = dummyRandomSubscribersList(size)
        val (previousCursor, nextCursor) = getStartAndEndTimestampCursorPage(data.map { SubscriberResponse.from(it) })
        return CursorPageResponse(
            data = data,
            prevPageCursor = previousCursor,
            nextPageCursor = nextCursor,
        )
    }

    fun dummyRandomSubscriberPageResponse(size: Int = 10): CursorPageResponse<SubscriberResponse> {
        val data = dummyRandomSubscribersList(size).map { SubscriberResponse.from(it) }
        val (previousCursor, nextCursor) = getStartAndEndTimestampCursorPage(data)
        return CursorPageResponse(
            data = data,
            prevPageCursor = previousCursor,
            nextPageCursor = nextCursor,
        )
    }

    private fun getStartAndEndTimestampCursorPage(data: List<SubscriberResponse>): Pair<String, String> {
        val startCreatedAt = data.first().createdAt
        val startCursor = startCreatedAt?.let { getTimestampCursorPage(it) }
            ?: TimestampCursor.DEFAULT_CURSOR.serialize()
        val lastCreatedAt = data.last().createdAt
        val endCursor = lastCreatedAt?.let { getTimestampCursorPage(it) }
            ?: TimestampCursor.DEFAULT_CURSOR.serialize()
        return Pair(startCursor, endCursor)
    }

    @Suppress("MultilineRawStringIndentation")
    fun generateRequest(
        email: String = faker.internet().emailAddress(),
        firstname: String = faker.name().firstName(),
        lastname: String = faker.name().lastName(),
    ): String = """
      {
           "email": "$email",
           "firstname": "$firstname",
           "lastname": "$lastname",
           "attributes": {
             "tags": ["tag1", "tag2"]
           }
       }
    """.trimIndent()

    private fun jsonToSubscriberResponseList(json: String): List<SubscriberResponse> {
        val mapper = jacksonObjectMapper()
        return mapper.readValue(json)
    }

    fun subscriberResponsesByBatch(batch: Int = 1): List<SubscriberResponse> {
        val url = javaClass.classLoader.getResource("db/subscriber/subscriber-pagination.json")
        val path = Paths.get(url?.toURI() ?: throw FileNotFoundException("File not found"))
        val subscribers: List<SubscriberResponse> = jsonToSubscriberResponseList(Files.readString(path))

        val batches: Map<Int, List<SubscriberResponse>> =
            subscribers.chunked(5).mapIndexed { index, list ->
                index + 1 to list
            }.toMap()

        return batches[batch] ?: emptyList()
    }
}
