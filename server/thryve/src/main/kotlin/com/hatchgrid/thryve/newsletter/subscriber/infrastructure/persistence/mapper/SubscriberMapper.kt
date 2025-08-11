package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.mapper

import com.hatchgrid.common.domain.vo.email.Email
import com.hatchgrid.common.domain.vo.name.FirstName
import com.hatchgrid.common.domain.vo.name.FirstNameNotValidException
import com.hatchgrid.common.domain.vo.name.LastName
import com.hatchgrid.common.domain.vo.name.Name
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberId
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import com.hatchgrid.thryve.workspace.domain.WorkspaceId

/**
 * Object responsible for mapping between the Subscriber domain object and the SubscriberEntity persistence object.
 */
object SubscriberMapper {
    /**
     * Extension function to convert a Subscriber domain object to a SubscriberEntity persistence object.
     *
     * @return The SubscriberEntity object.
     */
    fun Subscriber.toEntity(): SubscriberEntity {
        return SubscriberEntity(
            id = id.value,
            email = email.value,
            firstname = name.firstName.value.trim(),
            lastname = name.lastName?.value?.trim(),
            status = status,
            attributes = attributes,
            workspaceId = workspaceId.value,
            createdAt = createdAt,
            createdBy = createdBy,
            updatedAt = updatedAt,
            updatedBy = updatedBy,
        )
    }

    /**
     * Function to convert a SubscriberEntity persistence object to a Subscriber domain object.
     *
     * @return The Subscriber domain object.
     */

    fun SubscriberEntity.toDomain(): Subscriber {
        val firstNameRaw = firstname?.trim()
        val firstName = firstNameRaw?.takeIf { it.isNotEmpty() }?.let(::FirstName)
            ?: throw FirstNameNotValidException(firstname ?: "null")
        val lastNameRaw = lastname?.trim()
        val lastName = lastNameRaw?.takeIf { it.isNotEmpty() }?.let(::LastName)
        return Subscriber(
            id = SubscriberId(id),
            email = Email(email),
            name = Name(
                firstName = firstName,
                lastName = lastName,
            ),
            status = status,
            attributes = attributes,
            workspaceId = WorkspaceId(workspaceId),
            createdAt = createdAt,
            createdBy = createdBy,
            updatedAt = updatedAt,
            updatedBy = updatedBy,
        )
    }
}
