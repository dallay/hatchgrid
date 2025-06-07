package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.repository

import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatus
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.CountByStatusEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.CountByTagsEntity
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import com.hatchgrid.spring.boot.repository.ReactiveSearchRepository
import java.util.UUID
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
interface SubscriberReactiveR2dbcRepository :
    CoroutineCrudRepository<SubscriberEntity, UUID>,
    ReactiveSearchRepository<SubscriberEntity> {
    suspend fun findAllByStatus(status: SubscriberStatus): List<SubscriberEntity>

    @Query(
        """
        SELECT s.status, COUNT(s.id)
        FROM subscribers s
        WHERE  workspace_id = :workspaceId
        GROUP BY s.status
    """,
    )
    suspend fun countByStatus(workspaceId: UUID): List<CountByStatusEntity>
    @Query(
        """
            SELECT tag, COUNT(*)
            FROM (
                SELECT json_array_elements_text(attributes->'tags') AS tag
                FROM subscribers
                 WHERE  workspace_id = :workspaceId
            ) AS tags
            GROUP BY tag;
        """,
    )
    suspend fun countByTag(workspaceId: UUID): List<CountByTagsEntity>

    @Query(
        """
        SELECT *
        FROM subscribers
        WHERE  workspace_id = :workspaceId
        AND email IN (:emails)
        """,
    )
    suspend fun findAllByEmails(workspaceId: UUID, emails: Set<String>): List<SubscriberEntity>
}
