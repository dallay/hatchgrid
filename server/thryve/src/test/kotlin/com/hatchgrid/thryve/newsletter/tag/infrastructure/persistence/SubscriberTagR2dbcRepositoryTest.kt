package com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.domain.SubscriberTag
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.mapper.SubscriberTagMapper.toEntity
import com.hatchgrid.thryve.newsletter.tag.infrastructure.persistence.repository.SubscriberTagReactiveR2dbcRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test

@UnitTest
internal class SubscriberTagR2dbcRepositoryTest {
    private val subscriberTagReactiveR2dbcRepository: SubscriberTagReactiveR2dbcRepository = mockk()
    private val subscriberTagR2dbcRepository = SubscriberTagR2dbcRepository(subscriberTagReactiveR2dbcRepository)
    private val subscriberTag: SubscriberTag = TagStub.createSubscriberTag()

    @Test
    fun `create should successfully insert a new subscriber tag`(): Unit = runTest {
        val subscriberTagEntity = subscriberTag.toEntity()
        coEvery { subscriberTagReactiveR2dbcRepository.upsert(subscriberTagEntity) } returns 1

        subscriberTagR2dbcRepository.create(subscriberTag)

        coVerify(exactly = 1) { subscriberTagReactiveR2dbcRepository.upsert(subscriberTagEntity) }
    }

    @Test
    fun `update should successfully update an existing subscriber tag`(): Unit = runTest {
        val updateSubscriberTag = subscriberTag.copy()
        val subscriberTagEntity = updateSubscriberTag.toEntity()
        coEvery { subscriberTagReactiveR2dbcRepository.upsert(subscriberTagEntity) } returns 1

        subscriberTagR2dbcRepository.create(updateSubscriberTag)

        coVerify(exactly = 1) { subscriberTagReactiveR2dbcRepository.upsert(subscriberTagEntity) }
    }
}
