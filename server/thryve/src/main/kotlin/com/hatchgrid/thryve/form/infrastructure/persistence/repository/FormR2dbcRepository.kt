package com.hatchgrid.thryve.form.infrastructure.persistence.repository

import com.hatchgrid.spring.boot.repository.ReactiveSearchRepository
import com.hatchgrid.thryve.form.infrastructure.persistence.entity.FormEntity
import java.util.*
import org.springframework.data.repository.kotlin.CoroutineCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface FormR2dbcRepository :
    CoroutineCrudRepository<FormEntity, UUID>,
    ReactiveSearchRepository<FormEntity> {

    /**
     * Finds a form entity by its ID and workspace ID.
     *
     * @param id The unique identifier of the form to find
     * @param workspaceId The unique identifier of the workspace containing the form
     * @return The matching [FormEntity] if found, or null if no form exists with the given ID
     * in the specified workspace
     */
    suspend fun findByIdAndWorkspaceId(id: UUID, workspaceId: UUID): FormEntity?
}
