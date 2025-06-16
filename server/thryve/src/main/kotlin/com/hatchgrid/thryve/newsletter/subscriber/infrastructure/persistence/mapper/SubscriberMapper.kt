package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.mapper

import com.hatchgrid.thryve.newsletter.subscriber.domain.FirstName
import com.hatchgrid.thryve.newsletter.subscriber.domain.LastName
import com.hatchgrid.thryve.newsletter.subscriber.domain.Name
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberId
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.common.domain.vo.email.Email

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
            firstname = name.firstName.toString(),
            lastname = name.lastName.toString(),
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
        return Subscriber(
            id = SubscriberId(id),
            email = Email(email),
            name = Name(
                firstName = if (firstname.isNullOrBlank()) null else FirstName(firstname),
                lastName = if (lastname.isNullOrBlank()) null else lastname?.let { LastName(it) },
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
