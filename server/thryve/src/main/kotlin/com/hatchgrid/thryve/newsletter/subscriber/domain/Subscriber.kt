package com.hatchgrid.thryve.newsletter.subscriber.domain

import com.hatchgrid.common.domain.BaseEntity
import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.thryve.newsletter.subscriber.domain.event.SubscriberCreatedEvent
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import java.time.LocalDateTime
import java.util.*

/**
 * Represents a subscriber in the newsletter domain.
 *
 * @property id The unique identifier of the subscriber.
 * @property email The email address of the subscriber.
 * @property name The name of the subscriber.
 * @property status The status of the subscriber (default is ENABLED).
 * @property attributes Additional attributes associated with the subscriber.
 * @property workspaceId The ID of the workspace the subscriber belongs to.
 * @property createdAt The timestamp when the subscriber was created.
 * @property updatedAt The timestamp when the subscriber was last updated.
 */
data class Subscriber(
    override val id: SubscriberId,
    val email: Email,
    var name: Name,
    var status: SubscriberStatus = SubscriberStatus.ENABLED,
    val attributes: Attributes? = Attributes(),
    val workspaceId: WorkspaceId,
    override val createdAt: LocalDateTime = LocalDateTime.now(),
    override val createdBy: String = "system",
    override var updatedAt: LocalDateTime? = createdAt,
    override var updatedBy: String? = null
) : BaseEntity<SubscriberId>() {

    /**
     * Updates the name of the subscriber.
     *
     * @param name The new name of the subscriber.
     */
    fun updateName(name: Name) {
        this.name = name
    }

    /**
     * Updates the status of the subscriber.
     *
     * @param status The new status of the subscriber.
     */
    fun updateStatus(status: SubscriberStatus) {
        this.status = status
    }

    companion object {
        /**
         * Creates a new subscriber instance.
         *
         * @param id The unique identifier of the subscriber.
         * @param email The email address of the subscriber.
         * @param firstname The first name of the subscriber (optional).
         * @param lastname The last name of the subscriber (optional).
         * @param status The status of the subscriber (default is ENABLED).
         * @param attributes Additional attributes associated with the subscriber.
         * @param workspaceId The ID of the workspace the subscriber belongs to.
         * @param createdAt The timestamp when the subscriber was created.
         * @param updatedAt The timestamp when the subscriber was last updated (optional).
         * @return A new instance of the Subscriber class.
         */
        fun create(
            id: UUID,
            email: String,
            firstname: String? = null,
            lastname: String? = null,
            status: SubscriberStatus = SubscriberStatus.ENABLED,
            attributes: Attributes? = Attributes(),
            workspaceId: UUID,
            createdAt: LocalDateTime = LocalDateTime.now(),
            updatedAt: LocalDateTime? = null
        ): Subscriber {
            val subscriberId = SubscriberId(id)
            val subscriberEmail = Email(email)
            val subscriberName = Name(firstname, lastname)
            val subscriberworkspaceId = WorkspaceId(workspaceId)

            val subscriber = Subscriber(
                id = subscriberId,
                email = subscriberEmail,
                name = subscriberName,
                status = status,
                attributes = attributes,
                workspaceId = subscriberworkspaceId,
                createdAt = createdAt,
                updatedAt = updatedAt,
            )
            subscriber.record(
                SubscriberCreatedEvent(
                    subscriber.id.toString(),
                    subscriber.email.email,
                    subscriber.name.fullName(),
                    subscriber.status.name,
                    subscriber.attributes,
                    subscriber.workspaceId.toString(),
                ),
            )
            return subscriber
        }
    }
}
