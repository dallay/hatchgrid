package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.presentation.pagination.Cursor
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.pagination.OffsetPageResponse
import com.hatchgrid.common.domain.presentation.pagination.TimestampCursor
import com.hatchgrid.common.domain.presentation.sort.Sort
import com.hatchgrid.spring.boot.presentation.sort.toSpringSort
import com.hatchgrid.spring.boot.repository.R2DBCCriteriaParser
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.exceptions.SubscriberException
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.CountByStatusEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.CountByTagsEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.mapper.SubscriberMapper.toEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.repository.SubscriberReactiveR2dbcRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import io.kotest.common.runBlocking
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.flow.asFlow
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable

@UnitTest
internal class SubscriberR2dbcRepositoryTest {
    private val subscriberReactiveR2DbcRepository: SubscriberReactiveR2dbcRepository = mockk()
    private val subscriberRepository =
        SubscriberR2dbcRepository(subscriberReactiveR2DbcRepository)
    private lateinit var subscribers: List<Subscriber>
    private val workspaceId = WorkspaceId("9b2f1a0f-b484-43c8-8030-98d0f1208a42")

    @BeforeEach
    fun setUp() {
        subscribers = runBlocking { SubscriberStub.dummyRandomSubscribersList(10) }
        val subscribersEntities = subscribers.map { it.toEntity() }.toList()
        coEvery { subscriberReactiveR2DbcRepository.save(any()) } returns subscribersEntities.first()
        coEvery { subscriberReactiveR2DbcRepository.findAll() } returns subscribersEntities.asFlow()
        coEvery {
            subscriberReactiveR2DbcRepository.findAll(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Pageable::class),
                eq(SubscriberEntity::class),
            )
        } returns PageImpl(
            subscribersEntities,
        )

        coEvery {
            subscriberReactiveR2DbcRepository.findAllByCursor(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Int::class),
                eq(SubscriberEntity::class),
                any(org.springframework.data.domain.Sort::class),
                any(Cursor::class),
            )
        } returns
            CursorPageResponse(
                data = subscribersEntities,
                prevPageCursor = TimestampCursor(
                    subscribersEntities.first().createdAt,
                ).serialize(),
                nextPageCursor = TimestampCursor(
                    subscribersEntities.last().createdAt,
                ).serialize(),
            )

        coEvery { subscriberReactiveR2DbcRepository.findAllByStatus(any()) } returns subscribersEntities
        coEvery {
            subscriberReactiveR2DbcRepository
                .countByStatus(workspaceId.value)
        } returns listOf(
            CountByStatusEntity("ENABLED", 478_289L),
            CountByStatusEntity("DISABLED", 32L),
            CountByStatusEntity("BLOCKLISTED", 1L),
        )

        coEvery {
            subscriberReactiveR2DbcRepository
                .countByTag(eq(workspaceId.value))
        } returns listOf(
            CountByTagsEntity("tag1", 478_289L),
            CountByTagsEntity("tag2", 32L),
            CountByTagsEntity("tag3", 1L),
        )
    }

    @Test
    fun `should save a new subscriber`() = runTest {
        val subscriber = subscribers.first()
        subscriberRepository.create(subscriber)
        coVerify { subscriberReactiveR2DbcRepository.save(any()) }
    }

    @Test
    fun `should not save a new subscriber if it already exists`() = runTest {
        val subscriber = subscribers.first()
        coEvery { subscriberReactiveR2DbcRepository.save(any()) } throws DuplicateKeyException("Duplicate key")
        assertThrows<SubscriberException> {
            subscriberRepository.create(subscriber)
        }
    }

    @Test
    fun `should not save a new subscriber if an unknown exception occur`() = runTest {
        val subscriber = subscribers.first()

        coEvery { subscriberReactiveR2DbcRepository.save(any()) } throws RuntimeException("Unexpected error")
        assertThrows<RuntimeException> {
            subscriberRepository.create(subscriber)
        }
    }

    @Test
    fun `should search all subscribers by offset pagination`() = runTest {
        val response: OffsetPageResponse<Subscriber> =
            subscriberRepository.searchAllByOffset(Criteria.Empty)
        assertEquals(subscribers, response.data.toList())
        coVerify(exactly = 1) {
            subscriberReactiveR2DbcRepository.findAll(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Pageable::class),
                eq(SubscriberEntity::class),
            )
        }
    }

    @Test
    fun `should return empty OffsetPageResponse when no subscribers match the criteria`() =
        runTest {
            val criteria = Criteria.Equals("status", "NON_EXISTING_STATUS")
            val content: List<SubscriberEntity> = emptyList()
            coEvery {
                subscriberReactiveR2DbcRepository.findAll(
                    any(org.springframework.data.relational.core.query.Criteria::class),
                    any(Pageable::class),
                    eq(SubscriberEntity::class),
                )
            } returns PageImpl(content, PageRequest.of(0, 10), 0)

            val response = subscriberRepository.searchAllByOffset(criteria)
            val offsetPageResponse = OffsetPageResponse(emptyList<Subscriber>(), 0, 10, 0, 0)
            assertEquals(offsetPageResponse, response)
        }

    @Test
    fun `should search all subscribers by cursor pagination`() = runTest {
        val response: CursorPageResponse<Subscriber> =
            subscriberRepository.searchAllByCursor(Criteria.Empty)
        assertEquals(subscribers, response.data.toList())
        coVerify(exactly = 1) {
            subscriberReactiveR2DbcRepository.findAllByCursor(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Int::class),
                eq(SubscriberEntity::class),
                any(org.springframework.data.domain.Sort::class),
                any(Cursor::class),
            )
        }
    }

    @Test
    fun `should search all active subscribers`() = runTest {
        val response = subscriberRepository.searchActive().toList()
        assertEquals(subscribers, response)
    }

    @Test
    fun `should count all subscribers by status`() = runTest {
        val response = subscriberRepository.countByStatus(workspaceId).toList()
        assertEquals(3, response.size)
        assertEquals(478_289L, response.first { it.first == "ENABLED" }.second)
        assertEquals(32L, response.first { it.first == "DISABLED" }.second)
        assertEquals(1L, response.first { it.first == "BLOCKLISTED" }.second)
    }

    @Test
    fun `should count all subscribers by tags`() {
        runTest {
            val response = subscriberRepository.countByTag(workspaceId).toList()
            assertEquals(3, response.size)
            assertEquals(478_289L, response.first { it.first == "tag1" }.second)
            assertEquals(32L, response.first { it.first == "tag2" }.second)
            assertEquals(1L, response.first { it.first == "tag3" }.second)
        }
    }

    @Test
    fun `should search all BLOCKLISTED subscribers by criteria using offset pagination`() =
        runTest {
            val criteria = Criteria.Equals("status", "BLOCKLISTED")

            val response = subscriberRepository.searchAllByOffset(criteria)
            assertEquals(subscribers, response.data.toList())
            coVerify(exactly = 1) {
                subscriberReactiveR2DbcRepository.findAll(
                    any(org.springframework.data.relational.core.query.Criteria::class),
                    any(Pageable::class),
                    eq(SubscriberEntity::class),
                )
            }
        }

    @Test
    fun `should search all BLOCKLISTED subscribers by criteria using cursor pagination`() =
        runTest {
            val criteria = Criteria.Equals("status", "BLOCKLISTED")

            val response = subscriberRepository.searchAllByCursor(criteria)
            assertEquals(subscribers, response.data.toList())
            coVerify(exactly = 1) {
                subscriberReactiveR2DbcRepository.findAllByCursor(
                    any(org.springframework.data.relational.core.query.Criteria::class),
                    any(Int::class),
                    eq(SubscriberEntity::class),
                    any(org.springframework.data.domain.Sort::class),
                    any(Cursor::class),
                )
            }
        }

    @Test
    fun `should search all DISABLED subscribers by criteria using offset pagination`() =
        runTest {
            val criteria = Criteria.Equals("status", "DISABLED")

            val response = subscriberRepository.searchAllByOffset(criteria)
            assertEquals(subscribers, response.data.toList())
            coVerify(exactly = 1) {
                subscriberReactiveR2DbcRepository.findAll(
                    any(org.springframework.data.relational.core.query.Criteria::class),
                    any(Pageable::class),
                    eq(SubscriberEntity::class),
                )
            }
        }

    @Test
    fun `should search all DISABLED subscribers by criteria using cursor pagination`() =
        runTest {
            val criteria = Criteria.Equals("status", "DISABLED")

            val response = subscriberRepository.searchAllByCursor(criteria)
            assertEquals(subscribers, response.data.toList())
            coVerify(exactly = 1) {
                subscriberReactiveR2DbcRepository.findAllByCursor(
                    any(org.springframework.data.relational.core.query.Criteria::class),
                    any(Int::class),
                    eq(SubscriberEntity::class),
                    any(org.springframework.data.domain.Sort::class),
                    any(Cursor::class),
                )
            }
        }

    @Test
    fun `should search by criteria with multiple filters using offset pagination`() = runTest {
        val criteria = Criteria.And(
            listOf(
                Criteria.Equals("email", "email"),
                Criteria.Equals("firstname", "firstname"),
                Criteria.Equals("lastname", "lastname"),
                Criteria.Equals("status", "status"),
            ),
        )

        val response = subscriberRepository.searchAllByOffset(criteria)
        assertEquals(subscribers, response.data.toList())
        coVerify(exactly = 1) {
            subscriberReactiveR2DbcRepository.findAll(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Pageable::class),
                eq(SubscriberEntity::class),
            )
        }
    }

    @Test
    fun `should search by criteria with multiple filters using cursor pagination`() = runTest {
        val criteria = Criteria.And(
            listOf(
                Criteria.Equals("email", "email"),
                Criteria.Equals("firstname", "firstname"),
                Criteria.Equals("lastname", "lastname"),
                Criteria.Equals("status", "status"),
            ),
        )

        val response = subscriberRepository.searchAllByCursor(criteria)
        assertEquals(subscribers, response.data.toList())
        coVerify(exactly = 1) {
            subscriberReactiveR2DbcRepository.findAllByCursor(
                any(org.springframework.data.relational.core.query.Criteria::class),
                any(Int::class),
                eq(SubscriberEntity::class),
                any(org.springframework.data.domain.Sort::class),
                any(Cursor::class),
            )
        }
    }

    @Test
    fun `should search by criteria with multiple filters and sort using offset pagination`() =
        runTest {
            val criteria = Criteria.And(
                listOf(
                    Criteria.Equals("email", "email"),
                    Criteria.Equals("firstname", "firstname"),
                    Criteria.Equals("lastname", "lastname"),
                    Criteria.Equals("status", "status"),
                ),
            )
            val sort = Sort.by("email", "ASC").and(Sort.by("firstname", "DESC"))
            val criteriaParsed = R2DBCCriteriaParser(SubscriberEntity::class).parse(criteria)
            val sortCriteria = sort.toSpringSort()
            val pageable = PageRequest.of(0, 10, sortCriteria)
            coEvery {
                subscriberReactiveR2DbcRepository.findAll(
                    eq(criteriaParsed),
                    eq(pageable),
                    eq(SubscriberEntity::class),
                )
            } returns PageImpl(
                subscribers.map { it.toEntity() },
            )

            val response = subscriberRepository.searchAllByOffset(criteria, 10, 0, sort)
            assertEquals(subscribers, response.data.toList())
        }

    @Test
    fun `should search by criteria with multiple filters and sort using cursor pagination`() =
        runTest {
            val criteria = Criteria.And(
                listOf(
                    Criteria.Equals("email", "email"),
                    Criteria.Equals("firstname", "firstname"),
                    Criteria.Equals("lastname", "lastname"),
                    Criteria.Equals("status", "status"),
                ),
            )
            val sort = Sort.by("email", "ASC").and(Sort.by("firstname", "DESC"))
            val criteriaParsed = R2DBCCriteriaParser(SubscriberEntity::class).parse(criteria)
            val sortCriteria = sort.toSpringSort()
            coEvery {
                subscriberReactiveR2DbcRepository.findAllByCursor(
                    eq(criteriaParsed),
                    eq(10),
                    eq(SubscriberEntity::class),
                    eq(sortCriteria),
                    any(Cursor::class),
                )
            } returns CursorPageResponse(
                data = subscribers.map { it.toEntity() },
                prevPageCursor = TimestampCursor(
                    subscribers.first().createdAt,
                ).serialize(),
                nextPageCursor = TimestampCursor(
                    subscribers.last().createdAt,
                ).serialize(),
            )

            val response = subscriberRepository.searchAllByCursor(criteria, 10, sort)
            assertEquals(subscribers, response.data.toList())
        }
}
